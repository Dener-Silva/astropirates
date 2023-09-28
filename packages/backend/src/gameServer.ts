import { Input } from 'dtos';
import { Player } from './Player.js';

const players = new Map<number, Player>();
const inputs = new Map<number, Input[]>();
const takenNames = new Set<number>();

export function addPlayer(id: number, nickname: string) {
    // const name: number = firstName + (secondName << 8);
    // if (takenNames.has(name)) {
    //     throw new Error(`Name ${FirstName[firstName]} ${SecondName[secondName]} is already taken`);
    // }
    // players.set(id, new Player(firstName, secondName));
    // takenNames.add(name);
    console.log("addPlayer", id, nickname);
}

export function registerInputs(id: number, inputsList: Input[]) {
    // inputs.set(id, inputsList);
    console.log("registerInputs", id, inputsList);
}