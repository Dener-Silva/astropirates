import { ClientTopic, NeverError, inputType, setNicknameType, ServerTopic, topicType, gameUpdateType, welcomeType, newPlayerType } from "dtos";
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