import { GameServer } from "../src/GameServer.js";

jest.mock('../src/delta.js', () => ({ delta: 50 }));

test('Should nor add two players with the same name, and return false', () => {
    const gameServer = new GameServer();

    gameServer.addPlayer(0, 'Technocat');
    const result = gameServer.addPlayer(1, 'Technocat');

    expect(result).toBeFalsy();
});

test('Should free the name for use', () => {
    const gameServer = new GameServer();

    gameServer.addPlayer(0, 'Technocat');
    gameServer.removePlayer(0);
    const result = gameServer.addPlayer(1, 'Technocat');

    expect(result).toBeTruthy();
});