import { GameServer } from "../src/GameServer.js";
import { SweepAndPrune } from "../src/collision/SweepAndPrune.js";

jest.mock('../src/delta.js', () => ({ delta: 50 }));
jest.mock('../src/collision/SweepAndPrune.js');

test('Should not add two players with the same name, and return false', () => {
    const gameServer = new GameServer(new SweepAndPrune());

    gameServer.addPlayer('0', 'Technocat');
    const result = gameServer.addPlayer('1', 'Technocat');

    expect(result).toBeFalsy();
});

test('Should free the name for use', () => {
    const gameServer = new GameServer(new SweepAndPrune());

    gameServer.addPlayer('0', 'Technocat');
    gameServer.removePlayer('0');
    const result = gameServer.addPlayer('1', 'Technocat');

    expect(result).toBeTruthy();
});