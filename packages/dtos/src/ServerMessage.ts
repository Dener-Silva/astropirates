import avro from 'avro-js';

export enum ServerTopic {
    "SetNameResponse",
    "UpdateGameState"
}

export type SetNameResponse = {
    topic: ServerTopic.SetNameResponse
    id: number
    nickname: string
    success: boolean
}

export const setNameResponseType = avro.parse<SetNameResponse>({
    type: "record",
    name: "SetNameResponse",
    fields: [
        { name: "topic", type: "int" },
        { name: "id", type: "int" },
        { name: "nickname", type: "string" },
        { name: "success", type: "boolean" }
    ]
});