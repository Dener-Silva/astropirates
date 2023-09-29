import avro from "avro-js";
import { ServerTopic, SetNameResponse, setNameResponseType } from "../src/ServerMessage.js";

test('Compare before and after serialization (SetNameResponse)', () => {
    const message: SetNameResponse = {
        topic: ServerTopic.SetNameResponse,
        id: 0,
        nickname: "Technocat",
        success: true
    }

    const buf = setNameResponseType.toBuffer(message);
    const result = setNameResponseType.fromBuffer(buf);

    expect(result).toEqual(message);
});
