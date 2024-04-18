import { ClientTopic, NeverError, inputType, setNicknameType, ServerTopic, topicType, fullGameUpdateType, destroyedType, welcomeType, GameUpdate, gameUpdateType, partialGameUpdateType, getLeaderboardType, leaderboardType, rankType } from "dtos";
import { WebSocketServer, WebSocket } from "ws";
import { GameServer } from "./GameServer.js";
import { tickrate } from './delta.js';
import { newId } from "./newId.js";
import { Database } from "./Database.js";
import { createDelta } from "fossil-delta";
import { Type } from "avro-js";

export class GameWebSocketRunner {

    readonly needsFullUpdate = new WeakSet<WebSocket>();
    previousGameUpdate = Buffer.from([]);

    constructor(private wss: WebSocketServer, gameServer: GameServer, db: Database) {
        wss.on('connection', (ws) => {
            // TODO: check origin
            if (ws.protocol !== '') {
                return;
            }
            const id = newId();
            console.debug(`Welcome (ID ${id})`);
            const sendWelcome = () => {
                this.needsFullUpdate.add(ws);
                ws.send(welcomeType.toBuffer({
                    topic: ServerTopic.Welcome,
                    tickrate,
                    id
                }));
            };
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

            ws.on('message', async (data: Buffer) => {
                try {
                    const topic: ClientTopic = topicType.fromBuffer(data, undefined, true);
                    switch (topic) {
                        case ClientTopic.SetNickname:
                            const message = setNicknameType.fromBuffer(data);
                            const onDestroyed = async (byWhom: string) => {
                                const score = gameServer.scoreboard[id];
                                ws.send(destroyedType.toBuffer({ topic: ServerTopic.Destroyed, byWhom }));
                                const highScore = await db.getSessionHighScore(id)
                                if (score.score > highScore) {
                                    await db.addToLeaderboard(id, score);
                                    this.broadcast(topicType, ServerTopic.InvalidateLeaderboardCache);
                                    const [rowId, rowNumber] = await db.getLeaderboardPosition(id);
                                    ws.send(rankType.toBuffer({ topic: ServerTopic.Rank, rowId, rowNumber }));
                                }
                            }
                            // Try to add player to the server
                            if (message.nickname.startsWith('BOT ')) {
                                ws.send(topicType.toBuffer(ServerTopic.NicknameStartsWithBot));
                                break;
                            }
                            const player = gameServer.addPlayer(id, message.nickname, onDestroyed);
                            if (!player) {
                                ws.send(topicType.toBuffer(ServerTopic.NicknameAlreadyExists));
                            }
                            break;
                        case ClientTopic.Input:
                            gameServer.registerInputs(id, inputType.fromBuffer(data));
                            break;
                        case ClientTopic.GetLeaderboard:
                            const params = getLeaderboardType.fromBuffer(data);
                            const [rows, count] = await db.getLeaderboard(params)
                            ws.send(leaderboardType.toBuffer({
                                topic: ServerTopic.Leaderboard,
                                offset: params.offset,
                                rows,
                                count
                            }))
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
            if (ws.protocol === '') {
                ws.send(buffer);
            }
        }
    }

    onGameUpdate(gameUpdate: GameUpdate) {
        const fullGameUpdate = fullGameUpdateType.toBuffer({
            topic: ServerTopic.FullGameUpdate,
            ...gameUpdate
        })
        const gameUpdateBuffer = gameUpdateType.toBuffer(gameUpdate);
        const delta = Buffer.from(createDelta(this.previousGameUpdate, gameUpdateBuffer));
        const partialGameUpdate = partialGameUpdateType.toBuffer({
            topic: ServerTopic.PartialGameUpdate,
            delta
        })
        for (const ws of this.wss.clients) {
            if (ws.protocol === '') {
                if (this.needsFullUpdate.delete(ws)) {
                    ws.send(fullGameUpdate);
                } else {
                    ws.send(partialGameUpdate);
                }
            }
        }
        this.previousGameUpdate = gameUpdateBuffer;
    }

}