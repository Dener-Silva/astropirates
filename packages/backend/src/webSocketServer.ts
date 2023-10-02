import { ClientTopic, NeverError, inputType, setNicknameType, setNicknameResponseType, ServerTopic, topicType, gameUpdateType, welcomeType, newPlayerType, playerLoggedOutType } from "dtos";
import { WebSocketServer } from "ws";
import { GameServer } from "./GameServer.js";
import { delta, tickrate } from './delta.js';
import { SweepAndPrune } from "./collision/SweepAndPrune.js";

function encodeBase94(number: number) {
    const base94Chars = "!\"#$%&'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~";

    if (number === 0) {
        return '!';
    }

    let encoded = "";
    while (number > 0) {
        const remainder = number % 94;
        encoded = base94Chars[remainder] + encoded;
        number = Math.floor(number / 94);
    }

    return encoded;
}

export function runWebSocketServer(wss: WebSocketServer) {

    const gameServer = new GameServer(new SweepAndPrune());
    let currentId = 0;

    wss.on('connection', (ws) => {
        ws.send(welcomeType.toBuffer({ topic: ServerTopic.Welcome, tickrate, players: gameServer.players }))
        // Base94 strings use less bandwidth, but numeric strings might be a little faster
        // Needs more testing to see if the tradeoff is worth it
        const id = encodeBase94(currentId++);

        ws.on('error', console.error);

        ws.on('message', (data: Buffer) => {
            try {
                const topic: ClientTopic = topicType.fromBuffer(data, undefined, true);
                switch (topic) {
                    case ClientTopic.SetNickname:
                        const message = setNicknameType.fromBuffer(data);
                        // Try to add player to the server
                        const player = gameServer.addPlayer(id, message.nickname);
                        // Always respond with success or failure
                        ws.send(setNicknameResponseType.toBuffer({
                            topic: ServerTopic.SetNicknameResponse,
                            id,
                            nickname: message.nickname,
                            success: Boolean(player)
                        }))
                        // If player was successfully added, broadcast
                        if (player) {
                            for (const ws of wss.clients) {
                                ws.send(newPlayerType.toBuffer({
                                    topic: ServerTopic.NewPlayer,
                                    id,
                                    player
                                }));
                            }
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
            // Broadcast the fact that the player logged out
            for (const ws of wss.clients) {
                ws.send(playerLoggedOutType.toBuffer({
                    topic: ServerTopic.PlayerLoggedOut,
                    id
                }));
            }
            gameServer.removePlayer(id)
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