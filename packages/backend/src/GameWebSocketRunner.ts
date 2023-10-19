import { ClientTopic, NeverError, inputType, setNicknameType, ServerTopic, topicType, fullGameUpdateType, destroyedType, welcomeType, FullGameUpdate } from "dtos";
import { WebSocketServer, WebSocket } from "ws";
import { GameServer } from "./GameServer.js";
import { tickrate } from './delta.js';
import { newId } from "./newId.js";
import { Type } from "avro-js";

export class GameWebSocketRunner {

    readonly clients = new WeakSet<WebSocket>();

    constructor(private wss: WebSocketServer, gameServer: GameServer) {
        wss.on('connection', (ws) => {
            // TODO: check origin
            if (ws.protocol !== '') {
                return;
            }
            this.clients.add(ws);
            const id = newId();
            const sendWelcome = () => ws.send(welcomeType.toBuffer({
                topic: ServerTopic.Welcome,
                tickrate,
                id
            }));
            // Hack: Delay first message on dev environment
            // TODO: Fix race condition where the client receives the "welcome" message before all
            // React components are mounted.
            // Suggestion A: Only create the WebSocket connection after all React components are mounted
            // Suggestion B: Create a "Hello" ClientTopic to notify the server when the client is ready
            if (process.env.NODE_ENV === 'development') {
                setTimeout(sendWelcome, 300);
            } else {
                sendWelcome();
            }

            ws.on('error', console.error);

            ws.on('message', (data: Buffer) => {
                try {
                    const topic: ClientTopic = topicType.fromBuffer(data, undefined, true);
                    switch (topic) {
                        case ClientTopic.SetNickname:
                            const message = setNicknameType.fromBuffer(data);
                            const onDestroyed = (byWhom: string) => {
                                ws.send(destroyedType.toBuffer({ topic: ServerTopic.Destroyed, byWhom }));
                            }
                            // Try to add player to the server
                            const player = gameServer.addPlayer(id, message.nickname, onDestroyed);
                            if (player) {
                                console.debug(`Welcome ${gameServer.scoreboard[id]?.nickname} (ID ${id})`);
                            } else {
                                ws.send(topicType.toBuffer(ServerTopic.NicknameAlreadyExists));
                            }
                            break;
                        case ClientTopic.Input:
                            gameServer.registerInputs(id, inputType.fromBuffer(data));
                            break;
                        default:
                            throw new NeverError(topic, `Unknown message topic: ${topic}`);
                    }
                } catch (e) {
                    console.error(e);
                }
            });

            ws.on('close', () => {
                if (process.env.NODE_ENV !== 'test') {
                    console.debug(`Bye ${gameServer.scoreboard[id]?.nickname} (ID ${id})`)
                }
                gameServer.onPlayerLoggedOut(id);
            });
        });
    }

    private broadcast<T>(type: Type<T>, message: T) {
        const buffer = type.toBuffer(message);
        for (const ws of this.wss.clients) {
            if (this.clients.has(ws)) {
                ws.send(buffer);
            }
        }
    }

    onGameUpdate(gameUpdate: FullGameUpdate) {
        this.broadcast(fullGameUpdateType, gameUpdate);
    }

}