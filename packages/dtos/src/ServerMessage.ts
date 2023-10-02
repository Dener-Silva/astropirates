import avro from 'avro-js';

export enum ServerTopic {
    "Welcome",
    "NewPlayer",
    "GameUpdate",
    "SetNicknameResponse",
    "PlayerLoggedOut",
}

export type PlayerAttributes = { nickname: string }
export type Welcome = {
    topic: ServerTopic.Welcome
    tickrate: number
    players: Dictionary<PlayerAttributes>
}

const playerAttributesSchema = {
    name: "Player",
    type: "record",
    fields: [
        { name: "nickname", type: "string" }
    ]
}

export const welcomeType = avro.parse<Welcome>({
    type: "record",
    name: "Welcome",
    fields: [
        { name: "topic", type: "int" },
        { name: "tickrate", type: "double" },
        {
            name: "players", type: {
                type: "map",
                values: playerAttributesSchema
            }
        }
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

export type NewPlayer = {
    topic: ServerTopic.NewPlayer
    id: string
    player: PlayerAttributes
}

export const newPlayerType = avro.parse<NewPlayer>({
    type: "record",
    name: "NewPlayer",
    fields: [
        { name: "topic", type: "int" },
        { name: "id", type: "string" },
        { name: "player", type: playerAttributesSchema },
    ]
});

export type PlayerLoggedOut = {
    topic: ServerTopic.PlayerLoggedOut
    id: string
}

export const playerLoggedOutType = avro.parse<PlayerLoggedOut>({
    type: "record",
    name: "PlayerLoggedOut",
    fields: [
        { name: "topic", type: "int" },
        { name: "id", type: "string" },
    ]
});
