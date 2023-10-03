import { ClientTopic, NeverError, inputType, setNicknameType, ServerTopic, topicType, gameUpdateType, welcomeType, newPlayerType } from "dtos";
import { WebSocketServer } from "ws";
import { GameServer } from "./GameServer.js";
import { delta, tickrate } from './delta.js';
import { SweepAndPrune } from "./collision/SweepAndPrune.js";
import { newId } from "./newId.js";

export function runWebSocketServer(wss: WebSocketServer) {

    const gameServer = new GameServer(new SweepAndPrune());

    wss.on('connection', (ws) => {
        const id = newId();
        ws.send(welcomeType.toBuffer({ topic: ServerTopic.Welcome, tickrate, id, players: gameServer.players }))

        ws.on('error', console.error);

        ws.on('message', (data: Buffer) => {
            try {
                const topic: ClientTopic = topicType.fromBuffer(data, undefined, true);
                switch (topic) {
                    case ClientTopic.SetNickname:
                        const message = setNicknameType.fromBuffer(data);
                        // Try to add player to the server
                        const player = gameServer.addPlayer(id, message.nickname);
                        // If player was successfully added, broadcast
                        if (player) {
                            for (const ws of wss.clients) {
                                ws.send(newPlayerType.toBuffer({
                                    topic: ServerTopic.NewPlayer,
                                    id,
                                    player
                                }));
                            }
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
    });

    // Using setImmediate so the tickrate can be read from the dotenv file.
    setImmediate(() =>
        setInterval(() => {
            const state = gameServer.update();
            for (const ws of wss.clients) {
                ws.send(gameUpdateType.toBuffer(state));
            }
        }, delta)
    )
}