import { AdminTopic, ClientTopic, Dictionary, GameObjectState, GameUpdate, Input, NeverError, SetAiParameters, angleDistance, rotateTowards, setAiParametersType, topicType } from "dtos";
import { GameServer } from "./GameServer";
import { newId } from "./newId";
import { GameWebSocketRunner } from "./GameWebSocketRunner";
import { SweepAndPrune } from "./collision/SweepAndPrune";
import { Circle } from "./collision/colliders/Circle";
import { Collider } from "./collision/colliders/Collider";
import { delta } from "./delta";
import { WebSocket, WebSocketServer } from "ws";

enum ActorState {
    Idle,
    Chasing,
    StoppedChasing,
}

function randomAngle() {
    return 2 * Math.PI * Math.random();
}

type Actor = {
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
    chasingAISpeedMultiplier: 0.5,
    chasingPlayerSpeedMultiplier: 0.75,
    chasingAngularVelocity: 0.1,
    aiVisionDistance: 300,
    quantity: 3
} as const;

export class AI {

    readonly clients = new WeakSet<WebSocket>();

    actors: Dictionary<Actor> = {}
    players: Dictionary<Circle> = {}
    sap = new SweepAndPrune();
    aiParameters: SetAiParameters = defaultAiParameters;

    constructor(wss: WebSocketServer, private gameServer: GameServer, private webSocketServer: GameWebSocketRunner) {
        wss.on('connection', (ws) => {
            if (ws.protocol !== 'admin') {
                return;
            }
            this.clients.add(ws);

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
                                this.gameServer.players[id].state = GameObjectState.Exploded
                            }
                            break;
                        default:
                            throw new NeverError(topic, `Unknown message topic: ${topic}`);
                    }
                    // Broadcast
                    const buffer = setAiParametersType.toBuffer(this.aiParameters);
                    for (const ws of wss.clients) {
                        if (this.clients.has(ws)) {
                            ws.send(buffer);
                        }
                    }
                } catch (e) {
                    console.error(e);
                }
            }
            );
            ws.send(setAiParametersType.toBuffer(this.aiParameters));
        });
    }

    onGameUpdate(gameUpdate: GameUpdate) {

        for (const [id, player] of Object.entries(gameUpdate.players)) {
            let collider = this.players[id];
            if (!collider) {
                collider = this.players[id] = new Circle(this.aiParameters.aiVisionDistance / 2);
                this.sap.add(collider);
            }

            collider.x = player.x;
            collider.y = player.y;

            if (player.state > GameObjectState.ToBeRemoved) {
                const collider = this.players[id];
                this.sap.remove(collider);
                delete this.players[id];
                delete this.actors[id];
            }
        }

        for (const [a, b] of this.sap.update()) {
            if (a.owner && a.collidesWith(b)) {
                this.respondToEnemy(a.owner, b);
            }
            if (b.owner && b.collidesWith(a)) {
                this.respondToEnemy(b.owner, a);
            }
        }

        for (const [id, actor] of Object.entries(this.actors)) {
            const input = actor.input;
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
                    const collider = this.players[id];
                    // If on edge, go back to the center
                    if (Math.hypot(collider.x, collider.y) > 1000) {
                        const angleTowardsCenter = Math.atan2(collider.x, -collider.y) + Math.PI / 2;
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

        if (Object.keys(this.actors).length < this.aiParameters.quantity) {
            const id = newId()
            let player;
            let count = 1;
            while (!player) {
                player = this.gameServer.addPlayer(id, "BOT " + count++, () => { });
            }
            const collider = this.players[id] = new Circle(this.aiParameters.aiVisionDistance);
            collider.owner = player;
            this.sap.add(collider);
            this.webSocketServer.onPlayerAdded(id, player);
            this.actors[id] = {
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
    }

    respondToEnemy(ai: any, enemy: Collider) {
        const actor = this.actors[ai.id];
        actor.reactionTimer -= delta;
        // Don't chase if invulnerable
        if (actor.reactionTimer < 0 && ai.state !== GameObjectState.Invulnerable) {
            actor.state = ActorState.Chasing;
            // Only AI colliders have owner
            actor.chasingAi = Boolean(enemy.owner);
            actor.targetAngle = Math.atan2(enemy.x - ai.x, ai.y - enemy.y) - Math.PI / 2;
        }
    }

}