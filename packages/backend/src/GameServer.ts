import { GameUpdate, Input, Dictionary, ServerTopic } from 'dtos';
import { Player } from './Player.js';

export class GameServer {
    players: Dictionary<Player> = {};
    inputs: Dictionary<Input> = {};
    takenNames = new Set<string>();

    addPlayer(id: number, nickname: string): boolean {
        if (this.takenNames.has(nickname)) {
            return false;
        }
        console.debug(`Welcome ${nickname} (ID ${id})`)
        this.players[id] = new Player(nickname);
        this.takenNames.add(nickname);
        return true;
    }

    removePlayer(id: number) {
        console.debug(`Bye ${this.players[id]?.nickname} (ID ${id})`)
        const player = this.players[id];
        if (player) {
            this.takenNames.delete(player.nickname)
        }
        delete this.players[id];
        delete this.inputs[id];
    }

    registerInputs(id: number, input: Input) {
        this.inputs[id] = input;
    }

    update(): GameUpdate {
        for (const [id, input] of Object.entries(this.inputs)) {
            const player = this.players[id]!;
            player.move(input);
        }
        const state: GameUpdate = {
            topic: ServerTopic.GameUpdate,
            players: this.players
        }
        return state;
    }
}