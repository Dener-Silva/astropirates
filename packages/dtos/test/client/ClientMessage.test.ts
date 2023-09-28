import { ClientTopic } from "../../src/Enums.js";
import { ClientMessage } from "../../src/client/ClientMessage.js";
import { Input, InputTypes } from "../../src/index.js";

test('Check byteLength (SetName)', () => {
    const clientMessage = new ClientMessage(ClientTopic.SetName);
    clientMessage.nickname = 'Technocat';
    expect(clientMessage).toHaveAccurateByteLength();
});

test('Check byteLength (Input)', () => {
    const clientMessage = new ClientMessage(ClientTopic.Input);
    clientMessage.inputs = [
        new Input(InputTypes.StartShooting, 0),
        new Input(InputTypes.StopShooting, 25)
    ]
    expect(clientMessage).toHaveAccurateByteLength();
});

test('Compare before and after serialization (SetName)', () => {
    const clientMessage = new ClientMessage(ClientTopic.SetName);
    clientMessage.nickname = 'Technocat';
    const buffer = new ArrayBuffer(clientMessage.byteLength);
    const dataView = new DataView(buffer);

    clientMessage.serialize(dataView);
    const result = ClientMessage.deserialize(dataView);

    expect(result).toEqual(clientMessage);
});

test('Compare before and after serialization (Input)', () => {
    const clientMessage = new ClientMessage(ClientTopic.Input);
    clientMessage.inputs = [
        new Input(InputTypes.StartShooting, 0),
        new Input(InputTypes.StopShooting, 25)
    ]
    const buffer = new ArrayBuffer(clientMessage.byteLength);
    const dataView = new DataView(buffer);

    clientMessage.serialize(dataView);
    const result = ClientMessage.deserialize(dataView);

    expect(result).toEqual(clientMessage);
});

test('Trim whitespaces in name', () => {
    const clientMessage = new ClientMessage(ClientTopic.SetName);
    clientMessage.nickname = " Name with spaces before and after ";
    const buffer = new ArrayBuffer(clientMessage.byteLength);
    const dataView = new DataView(buffer);

    clientMessage.serialize(dataView);
    const result = ClientMessage.deserialize(dataView);

    expect(result.nickname).toEqual(clientMessage.nickname.trim());
});

test('Fail with unknown message topic', () => {
    const clientMessage = new ClientMessage(255 as any);
    expect(() => clientMessage.byteLength).toThrow();
});