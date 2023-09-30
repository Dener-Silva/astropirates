import { ClientTopic, Input } from "dtos";
import { Player } from "../src/Player.js";

jest.mock('../src/delta.js', () => ({ delta: 50 }));

test.each([
    0
])('Should rotate correctly', (angle) => {
    const player = new Player('Test');
    const input: Input = {
        topic: ClientTopic.Input,
        angle,
        magnitude: 1,
        shoot: false
    }

    for (let i = 0; i < 100; i++) {
        player.move(input)
    }

    expect(player.rotation).not.toBeNaN();
    expect(player.rotation).toBeCloseTo(angle);
});