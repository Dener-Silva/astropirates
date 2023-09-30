import avro from 'avro-js';

export enum ServerTopic {
    "SetNicknameResponse",
    "UpdateGameState"
}

export type SetNicknameResponse = {
    topic: ServerTopic.SetNicknameResponse
    id: number
    nickname: string
    success: boolean
}

export const setNicknameResponseType = avro.parse<SetNicknameResponse>({
    type: "record",
    name: "SetNicknameResponse",
    fields: [
        { name: "topic", type: "int" },
        { name: "id", type: "int" },
        { name: "nickname", type: "string" },
        { name: "success", type: "boolean" }
    ]
});