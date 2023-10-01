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

export type Player = { x: number, y: number, rotation: number }
export type Dictionary<T> = { [id: string]: T }
export type GameUpdate = {
    topic: ServerTopic.GameUpdate
    players: Dictionary<Player>
}

export const gameUpdateType = avro.parse<GameUpdate>({
    type: "record",
    name: "GameUpdate",
    fields: [
        { name: "topic", type: "int" },
        {
            name: "players", type: {
                type: "map",
                values: {
                    name: "Player",
                    type: "record",
                    fields: [
                        { name: "x", type: "float" },
                        { name: "y", type: "float" },
                        { name: "rotation", type: "float" }
                    ]
                }
            }
        }
    ]
});

export type SetNicknameResponse = {
    topic: ServerTopic.SetNicknameResponse
    id: string
    nickname: string
    success: boolean
}

export const setNicknameResponseType = avro.parse<SetNicknameResponse>({
    type: "record",
    name: "SetNicknameResponse",
    fields: [
        { name: "topic", type: "int" },
        { name: "id", type: "string" },
        { name: "nickname", type: "string" },
        { name: "success", type: "boolean" }
    ]
});