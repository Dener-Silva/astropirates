import { GameObjectState, GameUpdate, NewPlayer, ServerTopic, Welcome, gameUpdateType, newPlayerType, welcomeType } from "../src/ServerMessage.js";
import { toBeDeepCloseTo } from 'jest-matcher-deep-close-to';
expect.extend({ toBeDeepCloseTo });

test('Compare before and after serialization (Welcome)', () => {
    const message: Welcome = {
        topic: ServerTopic.Welcome,
        tickrate: 33.33333,
        id: '0',
        players: {
            0: { nickname: "Technocat" },
            1: { nickname: "You" },
        }
    }

    const buf = welcomeType.toBuffer(message);
    const result = welcomeType.fromBuffer(buf);

    expect(result).toEqual(message);
});

test('Compare before and after serialization (GameUpdate)', () => {
    const message: GameUpdate = {
        topic: ServerTopic.GameUpdate,
        players: {
            0: { state: GameObjectState.Active, x: 12.3, y: 23.4, rotation: Math.PI },
            1: { state: GameObjectState.Active, x: 34.5, y: 45.6, rotation: -Math.PI },
        },
        bullets: {
            2: { state: GameObjectState.Active, x: 56.7, y: 67.8 },
            3: { state: GameObjectState.Expired, x: 78.9, y: 89.1 },
        }
    }

    const buf = gameUpdateType.toBuffer(message);
    const result = gameUpdateType.fromBuffer(buf);

    expect(result).toBeDeepCloseTo(message);
});

test('Compare before and after serialization (NewPlayer)', () => {
    const message: NewPlayer = {
        topic: ServerTopic.NewPlayer,
        id: '0',
        player: { nickname: "Technocat" }
    }

    const buf = newPlayerType.toBuffer(message);
    const result = newPlayerType.fromBuffer(buf);

    expect(result).toEqual(message);
});
