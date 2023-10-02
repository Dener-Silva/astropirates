import { GameUpdate, NewPlayer, PlayerLoggedOut, ServerTopic, SetNicknameResponse, Welcome, gameUpdateType, newPlayerType, playerLoggedOutType, setNicknameResponseType, welcomeType } from "../src/ServerMessage.js";
import { toBeDeepCloseTo } from 'jest-matcher-deep-close-to';
expect.extend({ toBeDeepCloseTo });

test('Compare before and after serialization (Welcome)', () => {
    const message: Welcome = {
        topic: ServerTopic.Welcome,
        tickrate: 33.33333,
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
            0: { x: 12.3, y: 23.4, rotation: Math.PI },
            1: { x: 34.5, y: 56.7, rotation: -Math.PI },
        }
    }

    const buf = gameUpdateType.toBuffer(message);
    const result = gameUpdateType.fromBuffer(buf);

    expect(result).toBeDeepCloseTo(message);
});

test('Compare before and after serialization (SetNicknameResponse)', () => {
    const message: SetNicknameResponse = {
        topic: ServerTopic.SetNicknameResponse,
        id: '0',
        nickname: "Technocat",
        success: true
    }

    const buf = setNicknameResponseType.toBuffer(message);
    const result = setNicknameResponseType.fromBuffer(buf);

    expect(result).toEqual(message);
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

test('Compare before and after serialization (PlayerLoggedOut)', () => {
    const message: PlayerLoggedOut = {
        topic: ServerTopic.PlayerLoggedOut,
        id: '1'
    }

    const buf = playerLoggedOutType.toBuffer(message);
    const result = playerLoggedOutType.fromBuffer(buf);

    expect(result).toEqual(message);
});