import { ClientTopic, NeverError, inputType, setNicknameType, ServerTopic, topicType, gameUpdateType, welcomeType, newPlayerType, destroyedType } from "dtos";
import { WebSocketServer, WebSocket } from "ws";
import { GameServer } from "./GameServer.js";
import { delta, tickrate } from './delta.js';
import { SweepAndPrune } from "./collision/SweepAndPrune.js";
import { newId } from "./newId.js";
import { Type } from "avro-js";

export function runWebSocketServer(wss: WebSocketServer) {

    const gameServer = new GameServer(new SweepAndPrune());
    const ponged = new WeakSet<WebSocket>();

    function broadcast<T>(type: Type<T>, message: T) {
        const buffer = type.toBuffer(message);
        for (const ws of wss.clients) {
            ws.send(buffer);
        }
    }

    wss.on('connection', (ws) => {
        ponged.add(ws);
        const id = newId();
        const sendWelcome = () => ws.send(welcomeType.toBuffer({
            topic: ServerTopic.Welcome,
            tickrate,
            id,
            players: gameServer.players
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
                        // If player was successfully added, broadcast
                        if (player) {
                            broadcast(newPlayerType, {
                                topic: ServerTopic.NewPlayer,
                                id,
                                player
                            });
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
            gameServer.onPlayerLoggedOut(id);
        });

        ws.on('pong', () => ponged.add(ws));
    });

    // Using setImmediate so the tickrate can be read from the dotenv file.
    setImmediate(() =>
        setInterval(() => {
            const gameUpdate = gameServer.update();
            broadcast(gameUpdateType, gameUpdate);
            gameServer.cleanup();
        }, delta)
    )

    // Heartbeat
    setInterval(() => {
        for (const ws of wss.clients) {
            if (ponged.delete(ws)) {
                ws.ping();
            } else {
                console.log('Terminating connection because it did not respond to ping');
                ws.terminate();
            }
        }
    }, 30000);
}