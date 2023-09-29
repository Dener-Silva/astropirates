import avro from "avro-js";
import { ServerTopic } from "../../src/Enums.js";
import { ServerMessage, ServerMessageAvro, serverMessageSchema } from "../../src/server/ServerMessage.js";
import { SetNameResponse } from "../../src/server/SetNameResponse.js";

test('Check byteLength (SetNameResponse)', () => {
    const serverMessage = new ServerMessage(ServerTopic.SetNameResponse);
    serverMessage.setNameResponse = new SetNameResponse(0, 'Technocat', true);
    console.log(serverMessage.byteLength);
    expect(serverMessage).toHaveAccurateByteLength();
});

test.todo('Check byteLength (UpdateGameState)');

test('Compare before and after serialization (SetNameResponse)', () => {
    const serverMessage = new ServerMessage(ServerTopic.SetNameResponse);
    serverMessage.setNameResponse = new SetNameResponse(0, 'Technocat', true);
    const buffer = new ArrayBuffer(serverMessage.byteLength);
    const dataView = new DataView(buffer);

    serverMessage.serialize(dataView);
    const result = ServerMessage.deserialize(dataView);

    expect(result).toEqual(serverMessage);
});

test.todo('Compare before and after serialization (UpdateGameState)');

test('Fail with unknown message topic', () => {
    const serverMessage = new ServerMessage(255 as any);
    expect(() => serverMessage.byteLength).toThrow();
});

test('Avro', () => {
    const type = avro.parse(serverMessageSchema);
    const message: ServerMessageAvro = {
        id: 0,
        name: "Technocat",
        success: true
    }

    const buf = type.toBuffer(message);
    const result = type.fromBuffer(buf);

    console.log(new Int8Array(buf).length);

    expect(result).toEqual(message);
});