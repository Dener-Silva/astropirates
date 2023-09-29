import { Input } from 'dtos';
import { Player } from './Player.js';

export function createGameServer() {
    const players = new Map<number, Player>();
    const inputs = new Map<number, Input[]>();
    const takenNames = new Set<string>();

    function addPlayer(id: number, nickname: string) {
        console.log("addPlayer", id, nickname);
        if (takenNames.has(nickname)) {
            throw new Error(`Name ${nickname} is already taken`);
        }
        players.set(id, new Player(nickname));
        takenNames.add(nickname);
    }

    function removePlayer(id: number) {
        console.log("removePlayer", id);
        const player = players.get(id)
        if (player) {
            takenNames.delete(player.nickname)
            players.delete(id);
        }
    }

    function registerInputs(id: number, inputsList: Input[]) {
        console.log("registerInputs", id, inputsList);
        inputs.set(id, inputsList);
    }

    return {
        addPlayer,
        removePlayer,
        registerInputs
    }
}