import { ClientTopic, GameObjectState, Input } from "dtos";
import { Player } from "../src/Player.js";
import { Polygon } from "../src/collision/colliders/Polygon.js";
import { bulletSpeed } from "../src/Bullet.js";

jest.mock('../src/delta.js', () => ({ delta: 50 }));
jest.mock('../src/collision/colliders/Polygon.js')

test('Should rotate correctly', () => {
    const player = new Player('Test', new Polygon([]));
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
    const player = new Player('Test', new Polygon([]));
    const player2 = new Player('Test2', new Polygon([]));
    const bullet = player2.shoot();

    player.onCollision(bullet);

    expect(player.state).toBe(GameObjectState.Exploded);
});

test('Should not die to own bullet', () => {
    const player = new Player('Test', new Polygon([]));
    const bullet = player.shoot();

    player.onCollision(bullet);

    expect(player.state).toBe(GameObjectState.Active);
});

test('Should add own speed to bullet speed', () => {
    const player = new Player('Test', new Polygon([]));
    player.ySpeed = 10;
    const bullet = player.shoot();

    expect(bullet.ySpeed).toBe(bulletSpeed + 10);
});
