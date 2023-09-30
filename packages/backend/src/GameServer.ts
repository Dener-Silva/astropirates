import { GameUpdate, Input, ServerTopic } from 'dtos';
import { Player } from './Player.js';

export class GameServer {
    players = new Map<number, Player>();
    inputs = new Map<number, Input>();
    takenNames = new Set<string>();

    addPlayer(id: number, nickname: string): boolean {
        if (this.takenNames.has(nickname)) {
            return false;
        }
        console.debug(`Welcome ${nickname} (ID ${id})`)
        this.players.set(id, new Player(nickname));
        this.takenNames.add(nickname);
        return true;
    }

    removePlayer(id: number) {
        console.debug(`Bye ${this.players.get(id)?.nickname} (ID ${id})`)
        const player = this.players.get(id)
        if (player) {
            this.takenNames.delete(player.nickname)
        }
        this.players.delete(id);
        this.inputs.delete(id);
    }

    registerInputs(id: number, input: Input) {
        this.inputs.set(id, input);
    }

    update(): GameUpdate {
        for (const [id, input] of this.inputs) {
            const player = this.players.get(id)!;
            player.move(input);
        }
        const state: GameUpdate = {
            topic: ServerTopic.GameUpdate,
            positions: []
        }
        for (const [id, { x, y, rotation }] of this.players) {
            state.positions.push({ id, x, y, rotation });
        }
        return state;
    }
}