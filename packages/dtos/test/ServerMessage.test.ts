import avro from "avro-js";
import { ServerTopic, SetNicknameResponse, setNicknameResponseType } from "../src/ServerMessage.js";

test('Compare before and after serialization (SetNicknameResponse)', () => {
    const message: SetNicknameResponse = {
        topic: ServerTopic.SetNicknameResponse,
        id: 0,
        nickname: "Technocat",
        success: true
    }

    const buf = setNicknameResponseType.toBuffer(message);
    const result = setNicknameResponseType.fromBuffer(buf);

    expect(result).toEqual(message);
});
