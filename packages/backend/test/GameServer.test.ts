import { createGameServer } from "../src/GameServer.js";

test('Should fail to add two players with the same name', () => {
    const gameServer = createGameServer();

    gameServer.addPlayer(0, 'Technocat');

    expect(() => gameServer.addPlayer(1, 'Technocat')).toThrow();
});

test('Should free the name for use', () => {
    const gameServer = createGameServer();

    gameServer.addPlayer(0, 'Technocat');
    gameServer.removePlayer(0);

    expect(() => gameServer.addPlayer(1, 'Technocat')).not.toThrow();
});