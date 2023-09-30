import avro from 'avro-js';

export enum ServerTopic {
    "Tickrate",
    "GameUpdate",
    "SetNicknameResponse",
}

export type Tickrate = {
    topic: ServerTopic.Tickrate
    tickrate: number
}

export const tickrateType = avro.parse<Tickrate>({
    type: "record",
    name: "Tickrate",
    fields: [
        { name: "topic", type: "int" },
        { name: "tickrate", type: "double" }
    ]
});

export type GameUpdate = {
    topic: ServerTopic.GameUpdate
    positions:
    {
        id: number
        x: number
        y: number
        rotation: number
    }[]

}

export const gameUpdateType = avro.parse<GameUpdate>({
    type: "record",
    name: "GameUpdate",
    fields: [
        { name: "topic", type: "int" },
        {
            name: "positions", "type": {
                "type": "array",
                "items": {
                    "name": "position",
                    "type": "record",
                    "fields": [
                        { "name": "id", "type": "long" },
                        { "name": "x", "type": "double" },
                        { "name": "y", "type": "double" },
                        { "name": "rotation", "type": "double" }
                    ]
                }
            }
        }
    ]
});

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