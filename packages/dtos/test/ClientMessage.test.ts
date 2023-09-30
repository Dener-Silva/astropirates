import { ClientTopic, Input, SetNickname, inputType, setNicknameType } from "../src/ClientMessage.js"

test('Compare before and after serialization (SetNickname)', () => {
    const input: SetNickname = {
        topic: ClientTopic.SetNickname,
        nickname: 'Technocat'
    }

    const buffer = setNicknameType.toBuffer(input);
    const result = setNicknameType.fromBuffer(buffer);

    expect(result).toEqual(input);
});

test('Should limit name to 15 characters (SetNickname)', () => {
    const input: SetNickname = {
        topic: ClientTopic.SetNickname,
        nickname: 'Name longer than 15 characters'
    }

    const buffer = setNicknameType.toBuffer(input);
    const result = setNicknameType.fromBuffer(buffer);

    expect(result.nickname).toHaveLength(15);
});

test('Compare before and after serialization (Input)', () => {
    const input: Input = {
        topic: ClientTopic.Input,
        angle: 1,
        magnitude: 0.5,
        shoot: false
    }

    const buffer = inputType.toBuffer(input);
    const result = inputType.fromBuffer(buffer);

    expect(result).toEqual(input);
});

test.each([
    [-2, 0],
    [2, 1]
])('Should clamp magnitude between 0 and 1 (Input)', (magnitude, expected) => {
    const input: Input = {
        topic: ClientTopic.Input,
        angle: 1,
        magnitude,
        shoot: false
    }

    const buffer = inputType.toBuffer(input);
    const result = inputType.fromBuffer(buffer);

    expect(result.magnitude).toEqual(expected);
});