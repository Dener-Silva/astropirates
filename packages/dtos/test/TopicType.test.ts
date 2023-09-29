import { ClientTopic, Input, inputType } from "../src/ClientMessage.js";
import { topicType } from "../src/TopicType.js";

test('Should retreive topic type with no errors', () => {
    const input: Input = {
        topic: ClientTopic.Input,
        angle: 1,
        magnitude: 0.5,
        shoot: false
    }

    const buffer = inputType.toBuffer(input);
    const topic = topicType.fromBuffer(buffer, undefined, true);

    expect(topic).toEqual(ClientTopic.Input);
});