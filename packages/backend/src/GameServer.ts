import { Input } from 'dtos';
import { Player } from './Player.js';

export function createGameServer() {
    const players = new Map<number, Player>();
    const inputs = new Map<number, Input>();
    const takenNames = new Set<string>();

    function addPlayer(id: number, nickname: string): boolean {
        console.log("addPlayer", id, nickname);
        if (takenNames.has(nickname)) {
            return false;
        }
        players.set(id, new Player(nickname));
        takenNames.add(nickname);
        return true;
    }

    function removePlayer(id: number) {
        console.log("removePlayer", id);
        const player = players.get(id)
        if (player) {
            takenNames.delete(player.nickname)
            players.delete(id);
        }
    }

    function registerInputs(id: number, input: Input) {
        console.log("registerInputs", id, input);
        inputs.set(id, input);
    }

    return {
        addPlayer,
        removePlayer,
        registerInputs
    }
}