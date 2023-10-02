import { GameUpdate, Input, Dictionary, ServerTopic } from 'dtos';
import { Player } from './Player.js';
import { SweepAndPrune } from './collision/SweepAndPrune.js';
import { Polygon } from './collision/colliders/Polygon.js';

export class GameServer {
    players: Dictionary<Player> = {};
    inputs: Dictionary<Input> = {};
    takenNames = new Set<string>();

    constructor(private sweepAndPrune: SweepAndPrune) { }

    addPlayer(id: string, nickname: string): Player | null {
        if (this.takenNames.has(nickname)) {
            return null;
        }
        console.debug(`Welcome ${nickname} (ID ${id})`)
        const collider = new Polygon([-45, -30, -15, 0, -45, 30, 45, 0]);
        this.sweepAndPrune.add(collider);
        const player = new Player(nickname, collider);
        this.players[id] = player;
        this.takenNames.add(nickname);
        return player;
    }

    removePlayer(id: string) {
        console.debug(`Bye ${this.players[id]?.nickname} (ID ${id})`)
        const player = this.players[id];
        if (player) {
            this.takenNames.delete(player.nickname)
        }
        delete this.players[id];
        delete this.inputs[id];
        this.sweepAndPrune.remove([player.collider]);
    }

    registerInputs(id: string, input: Input) {
        this.inputs[id] = input;
    }

    update(): GameUpdate {
        // Proccess input
        for (const [id, input] of Object.entries(this.inputs)) {
            const player = this.players[id]!;
            player.move(input);
        }

        // Proccess collisions
        for (const [a, b] of this.sweepAndPrune.update()) {
            if (a.collidesWith(b)) {
                a.owner!.onCollision(b.owner);
                b.owner!.onCollision(a.owner);
            }
        }

        const state: GameUpdate = {
            topic: ServerTopic.GameUpdate,
            players: this.players
        }
        return state;
    }
}