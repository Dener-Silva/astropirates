import { ClientTopic, GameObjectState } from "dtos";
import { GameServer } from "../src/GameServer.js";
import { SweepAndPrune } from "../src/collision/SweepAndPrune.js";
import { Bullet } from "../src/Bullet.js";
import { Point } from "../src/collision/colliders/Point.js";
import { Player } from "../src/Player.js";

jest.mock('../src/delta.js', () => ({ delta: 50, tickrate: 20 }));

test('Should not add two players with the same name, and return false', () => {
    const gameServer = new GameServer(new SweepAndPrune());

    gameServer.addPlayer('0', 'Technocat', () => { });
    const result = gameServer.addPlayer('1', 'Technocat', () => { });

    expect(result).toBeFalsy();
});

test('Should free the name for use', () => {
    const gameServer = new GameServer(new SweepAndPrune());

    gameServer.addPlayer('0', 'Technocat', () => { });
    gameServer.onPlayerLoggedOut('0');
    gameServer.cleanup();
    const result = gameServer.addPlayer('1', 'Technocat', () => { });

    expect(result).toBeTruthy();
});

test('Should ignore when removePlayer is called on an ID that does not exist', () => {
    const gameServer = new GameServer(new SweepAndPrune());

    expect(() => gameServer.onPlayerLoggedOut('0')).not.toThrow();
});

test.each([
    GameObjectState.Offline,
    GameObjectState.Exploded
])('Should remove dead players', (state) => {
    const sweepAndPrune = new SweepAndPrune();
    const remove = sweepAndPrune.remove = jest.fn();
    const gameServer = new GameServer(sweepAndPrune);

    const player = gameServer.addPlayer('0', 'Technocat', () => { });
    expect(player).not.toBeNull();
    player!.state = state;

    gameServer.cleanup();

    expect(remove).toHaveBeenCalledWith(player!.collider);
    expect(gameServer.players['0']).toBeUndefined();
});

test.each([
    GameObjectState.Expired,
    GameObjectState.Exploded
])('Should remove dead bullets', (state) => {
    const sweepAndPrune = new SweepAndPrune();
    const remove = sweepAndPrune.remove = jest.fn();
    const gameServer = new GameServer(sweepAndPrune);

    const deadBullet = gameServer.bullets[0] = new Bullet({
        x: 0, y: 0, xSpeed: 0, ySpeed: 0
    }, new Point(), null as any);
    deadBullet.state = state;

    gameServer.cleanup();

    expect(remove).toHaveBeenCalledWith(deadBullet.collider);
    expect(gameServer.bullets[0]).toBeUndefined();
});

test("Should add bullet's collider", () => {
    const sweepAndPrune = new SweepAndPrune();
    const add = sweepAndPrune.add = jest.fn();
    const gameServer = new GameServer(sweepAndPrune);

    gameServer.addPlayer('0', 'Technocat', () => { });
    gameServer.registerInputs('0', {
        topic: ClientTopic.Input,
        angle: 0,
        magnitude: 0,
        shoot: true
    })

    gameServer.update();
    const player = Object.values(gameServer.players)[0];
    const bullet = Object.values(gameServer.bullets)[0];

    expect(add).toHaveBeenCalledWith(player.collider);
    expect(add).toHaveBeenCalledWith(bullet.collider);
});

test("Should ignore dead player's inputs", () => {
    const sweepAndPrune = new SweepAndPrune();
    const add = sweepAndPrune.add = jest.fn();
    const gameServer = new GameServer(sweepAndPrune);

    const player = gameServer.addPlayer('0', 'Technocat', () => { });
    player!.state = GameObjectState.Exploded;

    gameServer.update();
    gameServer.cleanup();

    gameServer.registerInputs('0', {
        topic: ClientTopic.Input,
        angle: 0,
        magnitude: 0,
        shoot: true
    })

    const result = gameServer.update();

    const bullets = Object.values(result.bullets);
    expect(bullets).toHaveLength(0);
    expect(add).toHaveBeenCalledTimes(1);
    expect(add).toHaveBeenCalledWith(player!.collider);
});

test('Adding player twice should be idempotent', () => {
    const sweepAndPrune = new SweepAndPrune();
    const add = sweepAndPrune.add = jest.fn();
    const remove = sweepAndPrune.remove = jest.fn();
    const gameServer = new GameServer(sweepAndPrune);

    const player = gameServer.addPlayer('0', 'Technocat', () => { });
    player!.state = GameObjectState.Exploded;
    gameServer.update();
    gameServer.cleanup();
    const player2 = gameServer.addPlayer('0', 'Technocat', () => { });
    const result = gameServer.update();

    expect(player2).toBeTruthy();
    expect(player2?.nickname).toEqual('Technocat');
    expect(result.players[0]).toBe(player2);
    expect(Object.keys(result.players)).toHaveLength(1);
    expect(add).toHaveBeenCalledTimes(2);
    expect(add).toHaveBeenCalledWith(player!.collider);
    expect(add).toHaveBeenCalledWith(player2!.collider);
    expect(remove).toHaveBeenCalledTimes(1);
    expect(remove).toHaveBeenCalledWith(player!.collider);
});

test('Should update the nickname', () => {
    const gameServer = new GameServer(new SweepAndPrune());

    // Simulate actual lifecycle
    const player = gameServer.addPlayer('0', 'Old Nickname', () => { });
    player!.state = GameObjectState.Exploded;
    gameServer.update()
    const player2 = gameServer.addPlayer('0', 'New Nickname', () => { });
    const result = gameServer.update();

    expect(player2).toBeTruthy();
    expect(player2?.nickname).toEqual('New Nickname');
    expect(result.players[0]).toBe(player2);
    expect(Object.keys(result.players)).toHaveLength(1);
});

test("Should remove dead players's nickname after they log out", () => {
    const gameServer = new GameServer(new SweepAndPrune());

    const player = gameServer.addPlayer('0', 'Technocat', () => { });
    expect(player).not.toBeNull();
    player!.state = GameObjectState.Exploded;
    gameServer.cleanup();
    let result = gameServer.addPlayer('0', 'Technocat', () => { });

    expect(result).not.toBeNull();
    expect(result!.nickname).toEqual('Technocat');
});

test("Buffer inputs", () => {
    const gameServer = new GameServer(new SweepAndPrune());

    gameServer.addPlayer('0', 'Technocat', () => { });
    gameServer.registerInputs('0', {
        topic: ClientTopic.Input,
        angle: 0,
        magnitude: 0,
        shoot: true
    });
    gameServer.registerInputs('0', {
        topic: ClientTopic.Input,
        angle: 0,
        magnitude: 0,
        shoot: false
    });
    let result = gameServer.update();

    const bullets = Object.values(result.bullets);
    expect(bullets.length).toEqual(1);
});

test("Buffer 2 inputs at most", () => {
    const gameServer = new GameServer(new SweepAndPrune());

    gameServer.addPlayer('0', 'Technocat', () => { });
    for (let i = 0; i < 3; i++) {
        gameServer.registerInputs('0', {
            topic: ClientTopic.Input,
            angle: 1,
            magnitude: 0,
            shoot: true
        });
    }

    expect(gameServer.inputs['0'].length).toEqual(2);
});

test("Take inputs in the order they are registered", () => {
    const gameServer = new GameServer(new SweepAndPrune());

    gameServer.addPlayer('0', 'Technocat', () => { });
    gameServer.registerInputs('0', {
        topic: ClientTopic.Input,
        angle: 0,
        magnitude: 0,
        shoot: false
    });
    gameServer.registerInputs('0', {
        topic: ClientTopic.Input,
        angle: 0,
        magnitude: 0,
        shoot: true
    });
    const result = gameServer.update();

    const bullets = Object.values(result.bullets);
    expect(bullets.length).toEqual(0);
});
