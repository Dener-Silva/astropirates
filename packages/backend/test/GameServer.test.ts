import { createGameServer } from "../src/GameServer.js";

test('Should nor add two players with the same name, and return false', () => {
    const gameServer = createGameServer();

    gameServer.addPlayer(0, 'Technocat');
    const result = gameServer.addPlayer(1, 'Technocat');

    expect(result).toBeFalsy();
});

test('Should free the name for use', () => {
    const gameServer = createGameServer();

    gameServer.addPlayer(0, 'Technocat');
    gameServer.removePlayer(0);
    const result = gameServer.addPlayer(1, 'Technocat');

    expect(result).toBeTruthy();
});