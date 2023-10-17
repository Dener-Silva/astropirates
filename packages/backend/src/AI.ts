import { ClientTopic, Dictionary, GameObjectState, GameUpdate, Input, NeverError, angleDistance, rotateTowards } from "dtos";
import { GameServer } from "./GameServer";
import { newId } from "./newId";
import { WebSocketServerRunner } from "./WebSocketServer";
import { SweepAndPrune } from "./collision/SweepAndPrune";
import { Circle } from "./collision/colliders/Circle";
import { Collider } from "./collision/colliders/Collider";
import { delta } from "./delta";

enum ActorState {
    Idle,
    Chasing,
    StoppedChasing,
}

function randomAngle() {
    return 2 * Math.PI * Math.random();
}

const reactionTime = 500;

type Actor = {
    state: ActorState
    angle: number
    targetAngle: number
    input: Input
    reactionTimer: number
}

export class AI {

    actors: Dictionary<Actor> = {}
    players: Dictionary<Circle> = {}
    sap = new SweepAndPrune();

    constructor(private gameServer: GameServer, private webSocketServer: WebSocketServerRunner) { }

    onGameUpdate(gameUpdate: GameUpdate) {

        for (const [id, player] of Object.entries(gameUpdate.players)) {
            let collider = this.players[id];
            if (!collider) {
                collider = this.players[id] = new Circle(200);
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
                    const angleDist = Math.abs(angleDistance(actor.angle, actor.targetAngle));
                    input.shoot = angleDist < Math.PI / 2;
                    input.angle = actor.angle = rotateTowards(actor.angle, actor.targetAngle, 0.1);
                    const magnitude = (1 - Math.sqrt(angleDist / Math.PI)) - 0.5;
                    input.magnitude = Math.max(magnitude, 0);
                    actor.state = ActorState.StoppedChasing;
                    break;
                case ActorState.StoppedChasing:
                    actor.state = ActorState.Idle;
                    actor.reactionTimer = reactionTime;
                    break;
                case ActorState.Idle:
                    input.shoot = false;
                    input.magnitude = 0.1;
                    input.angle = actor.angle = rotateTowards(actor.angle, actor.targetAngle, 0.01);
                    if (angleDistance(input.angle, actor.targetAngle) < 0.01) {
                        actor.targetAngle = randomAngle();
                    }
                    break;
                default:
                    throw new NeverError(actor.state);
            }
            this.gameServer.registerInputs(id, { ...input });
        }

        if (Object.keys(this.actors).length < 3) {
            const id = newId()
            let player;
            let count = 1;
            while (!player) {
                player = this.gameServer.addPlayer(id, "BOT " + count++, () => { });
            }
            const collider = this.players[id] = new Circle(200);
            collider.owner = player;
            this.sap.add(collider);
            this.webSocketServer.onPlayerAdded(id, player);
            this.actors[id] = {
                state: ActorState.Idle,
                angle: randomAngle(),
                targetAngle: randomAngle(),
                input: {
                    topic: ClientTopic.Input,
                    shoot: false,
                    magnitude: 0,
                    angle: 0
                },
                reactionTimer: reactionTime,
            };
        }
    }

    respondToEnemy(ai: any, enemy: Collider) {
        const actor = this.actors[ai.id];
        actor.reactionTimer -= delta;
        // Don't chase if invulnerable
        if (actor.reactionTimer < 0 && ai.state !== GameObjectState.Invulnerable) {
            actor.state = ActorState.Chasing;
            actor.targetAngle = Math.atan2(enemy.x - ai.x, ai.y - enemy.y) - Math.PI / 2;
        }
    }

}