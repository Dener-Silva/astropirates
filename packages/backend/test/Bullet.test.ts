import { GameObjectState } from "dtos";
import { Player } from "../src/Player.js";
import { Polygon } from "../src/collision/colliders/Polygon.js";

jest.mock('../src/delta.js', () => ({ delta: 50 }));
jest.mock('../src/collision/colliders/Polygon.js')

test('Should not explode to owner', () => {
    const player = new Player('0', new Polygon([]), () => { });
    const bullet = player.shoot();

    bullet.onCollision(player);

    expect(bullet.state).toBe(GameObjectState.Active);
});