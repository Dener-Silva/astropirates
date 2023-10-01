import { GameUpdate, ServerTopic, SetNicknameResponse, Tickrate, gameUpdateType, setNicknameResponseType, tickrateType } from "../src/ServerMessage.js";
import { toBeDeepCloseTo } from 'jest-matcher-deep-close-to';
expect.extend({ toBeDeepCloseTo });

test('Compare before and after serialization (Tickrate)', () => {
    const message: Tickrate = {
        topic: ServerTopic.Tickrate,
        tickrate: 33.33333
    }

    const buf = tickrateType.toBuffer(message);
    const result = tickrateType.fromBuffer(buf);

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