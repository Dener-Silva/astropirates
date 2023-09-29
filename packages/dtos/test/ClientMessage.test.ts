import { ClientTopic, Input, SetName, inputType, setNameType } from "../src/ClientMessage.js"
import { topicType } from "../src/TopicType.js";

test('Compare before and after serialization (SetName)', () => {
    const input: SetName = {
        topic: ClientTopic.SetName,
        nickname: 'Technocat'
    }

    const buffer = setNameType.toBuffer(input);
    const result = setNameType.fromBuffer(buffer);

    expect(result).toEqual(input);
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