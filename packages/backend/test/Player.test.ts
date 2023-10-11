import { ClientTopic, GameObjectState, Input } from "dtos";
import { Player } from "../src/Player.js";
import { Polygon } from "../src/collision/colliders/Polygon.js";
import { bulletSpeed } from "../src/Bullet.js";

jest.mock('../src/delta.js', () => ({ delta: 50 }));
jest.mock('../src/collision/colliders/Polygon.js')

test('Should rotate correctly', () => {
    const player = new Player('0', 'Test', new Polygon([]), () => { });
    const input: Input = {
        topic: ClientTopic.Input,
        angle: 0,
        magnitude: 1,
        shoot: false
    }

    for (let i = 0; i < 100; i++) {
        player.move(input)
    }

    expect(player.rotation).not.toBeNaN();
    expect(player.rotation).toBeCloseTo(0);
});

test('Should die to bullet', () => {
    const player = new Player('0', 'Test', new Polygon([]), () => { });
    const player2 = new Player('1', 'Test2', new Polygon([]), () => { });
    const bullet = player2.shoot();

    player.onCollision(bullet);

    expect(player.state).toBe(GameObjectState.Exploded);
});

test('Should call onScoreChanged', () => {
    const onDestroyed1 = jest.fn();
    const player1 = new Player('0', 'Test1', new Polygon([]), onDestroyed1);
    const onDestroyed2 = jest.fn();
    const player2 = new Player('1', 'Test2', new Polygon([]), onDestroyed2);
    const bullet = player2.shoot();

    player1.onCollision(bullet);

    expect(onDestroyed1).toHaveBeenCalledTimes(1);
    expect(onDestroyed1).toHaveBeenCalledWith('1');
    expect(onDestroyed2).not.toHaveBeenCalled();
});

test('Should not die to own bullet', () => {
    const player = new Player('0', 'Test', new Polygon([]), () => { });
    const bullet = player.shoot();

    player.onCollision(bullet);

    expect(player.state).toBe(GameObjectState.Active);
});

test('Should add own speed to bullet speed', () => {
    const player = new Player('0', 'Test', new Polygon([]), () => { });
    player.ySpeed = 10;
    const bullet = player.shoot();

    expect(bullet.ySpeed).toBe(bulletSpeed + 10);
});

test.each([
    [1600, 0, 0],
    [-1600, 0, Math.PI],
    [0, 1600, Math.PI / 2],
    [0, -1600, -Math.PI / 2],
])('Limit distance without killing the speed: x:%f, y:%f, angle:%f', (x, y, angle) => {
    const player = new Player('0', 'Test', new Polygon([]), () => { });
    player.x = x;
    player.y = y;
    player.rotation = angle;
    player.move({
        topic: ClientTopic.Input,
        angle,
        magnitude: 1,
        shoot: false
    });

    expect(player.x).toBeCloseTo(x);
    expect(player.y).toBeCloseTo(y);
    expect(player.rotation).toBeCloseTo(angle);
    expect(Math.hypot(player.xSpeed, player.ySpeed)).toBeGreaterThan(0);
});