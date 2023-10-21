import { GameObjectState, ServerTopic, FullGameUpdate, destroyedType, fullGameUpdateType, Destroyed, Welcome, welcomeType, PartialGameUpdate, partialGameUpdateType, GameUpdate, gameUpdateType, Leaderboard, leaderboardType, Rank, rankType } from "../src/ServerMessage.js";
import { toBeDeepCloseTo } from 'jest-matcher-deep-close-to';
expect.extend({ toBeDeepCloseTo });

test('Compare before and after serialization (Welcome)', () => {
    const message: Welcome = {
        topic: ServerTopic.Welcome,
        tickrate: 33.33333,
        id: '0'
    }

    const buf = welcomeType.toBuffer(message);
    const result = welcomeType.fromBuffer(buf);

    expect(result).toEqual(message);
});

test('Compare before and after serialization (GameUpdate)', () => {
    const message: GameUpdate = {
        players: {
            0: { state: GameObjectState.Active, x: 12.3, y: 23.4, rotation: Math.PI },
            1: { state: GameObjectState.Active, x: 34.5, y: 45.6, rotation: -Math.PI },
        },
        bullets: {
            2: { state: GameObjectState.Active, x: 56.7, y: 67.8 },
            3: { state: GameObjectState.Expired, x: 78.9, y: 89.1 },
        },
        scoreboard: {
            0: { nickname: 'Player 1', score: 0 },
            1: { nickname: 'Player 2', score: 100 },
        }
    }

    const buf = gameUpdateType.toBuffer(message);
    const result = gameUpdateType.fromBuffer(buf);

    expect(result).toBeDeepCloseTo(message);
});

test('Compare before and after serialization (FullGameUpdate)', () => {
    const message: FullGameUpdate = {
        topic: ServerTopic.FullGameUpdate,
        players: {
            0: { state: GameObjectState.Active, x: 12.3, y: 23.4, rotation: Math.PI },
            1: { state: GameObjectState.Active, x: 34.5, y: 45.6, rotation: -Math.PI },
        },
        bullets: {
            2: { state: GameObjectState.Active, x: 56.7, y: 67.8 },
            3: { state: GameObjectState.Expired, x: 78.9, y: 89.1 },
        },
        scoreboard: {
            0: { nickname: 'Player 1', score: 0 },
            1: { nickname: 'Player 2', score: 100 },
        }
    }

    const buf = fullGameUpdateType.toBuffer(message);
    const result = fullGameUpdateType.fromBuffer(buf);

    expect(result).toBeDeepCloseTo(message);
});

test('Compare before and after serialization (PartialGameUpdate)', () => {
    const message: PartialGameUpdate = {
        topic: ServerTopic.PartialGameUpdate,
        delta: Buffer.from('Pretend this is binary data')
    }

    const buf = partialGameUpdateType.toBuffer(message);
    const result = partialGameUpdateType.fromBuffer(buf);

    expect(result).toEqual(message);
});

test('Compare before and after serialization (Destroyed)', () => {
    const message: Destroyed = {
        topic: ServerTopic.Destroyed,
        byWhom: '0'
    }

    const buf = destroyedType.toBuffer(message);
    const result = destroyedType.fromBuffer(buf);

    expect(result).toEqual(message);
});

test('Compare before and after serialization (Leaderboard)', () => {
    const message: Leaderboard = {
        topic: ServerTopic.Leaderboard,
        offset: 100,
        rows: [
            {
                id: 24n,
                name: 'Technocat',
                score: 100n,
                rank: 1n
            }
        ],
        count: 1n
    }

    const buf = leaderboardType.toBuffer(message);
    const result = leaderboardType.fromBuffer(buf);

    expect(result).toEqual(message);
});

test('Compare before and after serialization (Rank)', () => {
    const message: Rank = {
        topic: ServerTopic.Rank,
        rowId: 321n,
        rowNumber: 123n
    }

    const buf = rankType.toBuffer(message);
    const result = rankType.fromBuffer(buf);

    expect(result).toEqual(message);
});
