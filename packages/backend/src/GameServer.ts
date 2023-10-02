import { GameUpdate, Input, Dictionary, ServerTopic } from 'dtos';
import { Player } from './Player.js';

export class GameServer {
    players: Dictionary<Player> = {};
    inputs: Dictionary<Input> = {};
    takenNames = new Set<string>();

    addPlayer(id: string, nickname: string): Player | null {
        if (this.takenNames.has(nickname)) {
            return null;
        }
        console.debug(`Welcome ${nickname} (ID ${id})`)
        const player = new Player(nickname);
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
    }

    registerInputs(id: string, input: Input) {
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