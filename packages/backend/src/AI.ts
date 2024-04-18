import { AdminTopic, ClientTopic, Dictionary, GameObjectState, GameUpdate, Input, NeverError, Player, ServerTopic, SetAiParameters, angleDistance, distance, rotateTowards, setAiParametersType, topicType } from "dtos";
import { GameServer } from "./GameServer";
import { newId } from "./newId";
import { delta } from "./delta";
import { WebSocketServer } from "ws";
import { Database } from "./Database";

enum ActorState {
    Idle,
    Chasing,
    StoppedChasing,
}

function randomAngle() {
    return 2 * Math.PI * Math.random();
}

type Actor = {
    nick: string
    state: ActorState
    targetAngle: number
    input: Input
    reactionTimer: number
    chasingAi: boolean
}

const defaultAiParameters = {
    topic: AdminTopic.SetAiParameters,
    reactionTime: 500,
    idleSpeed: 0.1,
    idleAngularVelocity: 0.01,
    chasingAISpeedMultiplier: 0.6,
    chasingPlayerSpeedMultiplier: 0.75,
    chasingAngularVelocity: 0.1,
    aiVisionDistance: 600,
    quantity: 3
} as const;

export class AI {

    ids: string[] = []
    actors: Dictionary<Actor> = {}
    aiParameters: SetAiParameters = defaultAiParameters;

    constructor(private wss: WebSocketServer, private gameServer: GameServer, private db: Database) {

        db.deleteBotsFromLeaderboard();

        wss.on('connection', (ws) => {
            if (ws.protocol !== 'admin') {
                return;
            }

            ws.on('message', (data: Buffer) => {

                try {
                    const topic: AdminTopic = topicType.fromBuffer(data, undefined, true);
                    switch (topic) {
                        case AdminTopic.SetAiParameters:
                            this.aiParameters = setAiParametersType.fromBuffer(data);
                            break;
                        case AdminTopic.ResetAiParameters:
                            this.aiParameters = defaultAiParameters;
                            break;
                        case AdminTopic.KillBots:
                            for (const id in this.actors) {
                                const ai = this.gameServer.players[id];
                                if (ai) {
                                    ai.state = GameObjectState.Exploded
                                }
                            }
                            break;
                        case AdminTopic.DeleteBotsFromLeaderboard:
                            db.deleteBotsFromLeaderboard();
                            this.invalidateLeaderboardCache();
                            break;
                        default:
                            throw new NeverError(topic, `Unknown message topic: ${topic}`);
                    }
                    // Broadcast
                    const buffer = setAiParametersType.toBuffer(this.aiParameters);
                    for (const ws of wss.clients) {
                        if (ws.protocol === 'admin') {
                            ws.send(buffer);
                        }
                    }
                } catch (e) {
                    console.error(e);
                }
            });
            ws.send(setAiParametersType.toBuffer(this.aiParameters));
        });
    }

    onGameUpdate(gameUpdate: GameUpdate) {

        for (const [id, actor] of Object.entries(this.actors)) {
            const input = actor.input;
            const ai = gameUpdate.players[id];

            if (!ai) {
                this.addPlayer(id, actor, gameUpdate);
                continue;
            }

            for (const [enemyId, enemy] of Object.entries(gameUpdate.players)) {
                if (enemy === ai) continue;
                if (distance(ai.x, ai.y, enemy.x, enemy.y) < this.aiParameters.aiVisionDistance) {
                    this.respondToEnemy(id, ai, enemyId, enemy);
                }
            }

            switch (actor.state) {
                case ActorState.Chasing:
                    const angleDist = Math.abs(angleDistance(input.angle, actor.targetAngle));
                    input.shoot = angleDist < Math.PI / 2;
                    input.angle = rotateTowards(input.angle, actor.targetAngle, this.aiParameters.chasingAngularVelocity);
                    if (angleDist > Math.PI / 2) {
                        input.magnitude = 0;
                    } else {
                        // AI is slower vs AI to avoid stalemate
                        const multiplier = actor.chasingAi ? this.aiParameters.chasingAISpeedMultiplier : this.aiParameters.chasingPlayerSpeedMultiplier;
                        input.magnitude = (1 - Math.sin(angleDist)) * multiplier;
                    }
                    actor.state = ActorState.StoppedChasing;
                    break;
                case ActorState.StoppedChasing:
                    actor.state = ActorState.Idle;
                    actor.reactionTimer = this.aiParameters.reactionTime;
                    break;
                case ActorState.Idle:
                    input.shoot = false;
                    input.magnitude = this.aiParameters.idleSpeed;
                    input.angle = rotateTowards(input.angle, actor.targetAngle, this.aiParameters.idleAngularVelocity);
                    // If on edge, go back to the center
                    if (Math.hypot(ai.x, ai.y) > 1000) {
                        const angleTowardsCenter = Math.atan2(ai.x, -ai.y) + Math.PI / 2;
                        actor.targetAngle = angleTowardsCenter;
                    } else if (Math.abs(angleDistance(input.angle, actor.targetAngle)) < this.aiParameters.idleAngularVelocity) {
                        actor.targetAngle = randomAngle();
                    }
                    break;
                default:
                    throw new NeverError(actor.state);
            }
            this.gameServer.registerInputs(id, { ...input });
        }

        const actorsQuantity = Object.keys(this.actors).length
        if (actorsQuantity < this.aiParameters.quantity) {
            // Spawn more actors
            const id = this.ids[actorsQuantity] = this.ids[actorsQuantity] || newId();
            const nick = "BOT " + (actorsQuantity + 1);
            this.actors[id] = {
                nick,
                state: ActorState.Idle,
                targetAngle: randomAngle(),
                input: {
                    topic: ClientTopic.Input,
                    shoot: false,
                    magnitude: 0,
                    angle: randomAngle()
                },
                reactionTimer: this.aiParameters.reactionTime,
                chasingAi: false
            };
        }
        if (actorsQuantity > this.aiParameters.quantity) {
            // Delete actors
            const id = this.ids[actorsQuantity - 1];
            this.gameServer.onPlayerLoggedOut(id);
            delete this.actors[id]
        }

    }

    addPlayer(id: string, actor: Actor, gameUpdate: GameUpdate) {
        this.gameServer.addPlayer(id, actor.nick, async () => {
            const highScore = await this.db.getSessionHighScore(id);
            const score = gameUpdate.scoreboard[id];
            if (score && score.score > highScore) {
                await this.db.addToLeaderboard(id, score);
                this.invalidateLeaderboardCache();
            }
        });
        actor.state = ActorState.Idle
    }

    respondToEnemy(aiId: string, ai: Player, enemyId: string, enemy: Player) {
        const actor = this.actors[aiId];
        actor.reactionTimer -= delta;
        // Don't chase if invulnerable
        if (actor.reactionTimer < 0 && ai.state !== GameObjectState.Invulnerable) {
            actor.state = ActorState.Chasing;
            actor.chasingAi = Boolean(this.actors[enemyId]);
            actor.targetAngle = Math.atan2(enemy.x - ai.x, ai.y - enemy.y) - Math.PI / 2;
        }
    }

    invalidateLeaderboardCache() {
        for (const ws of this.wss.clients) {
            if (ws.protocol === '') {
                ws.send(topicType.toBuffer(ServerTopic.InvalidateLeaderboardCache));
            }
        }
    }

}