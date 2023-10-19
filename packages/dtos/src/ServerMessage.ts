import avro from 'avro-js';

export enum ServerTopic {
    Welcome,
    GameUpdate,
    FullGameUpdate,
    PartialGameUpdate,
    NicknameAlreadyExists,
    Destroyed,
}

export type Welcome = {
    topic: ServerTopic.Welcome
    id: string
    tickrate: number
}

export const welcomeType = avro.parse<Welcome>({
    type: "record",
    name: "Welcome",
    fields: [
        { name: "topic", type: "int" },
        { name: "id", type: "string" },
        { name: "tickrate", type: "double" }
    ]
});

export enum GameObjectState {
    Invulnerable,
    Active,
    // The server will delete objects with the states below
    ToBeRemoved,
    Expired,
    Offline,
    Exploded
}

export type Dictionary<T> = { [id: string]: T }
export type Player = { state: GameObjectState, x: number, y: number, rotation: number }
export type Bullet = { state: GameObjectState, x: number, y: number }
export type Score = { nickname: string, score: number }
export type GameUpdate = {
    players: Dictionary<Player>
    bullets: Dictionary<Bullet>
    scoreboard: Dictionary<Score>
}

const gameUpdateFields = [
    {
        name: "players", type: {
            type: "map",
            values: {
                name: "Player",
                type: "record",
                fields: [
                    { name: "state", type: "int" },
                    { name: "x", type: "float" },
                    { name: "y", type: "float" },
                    { name: "rotation", type: "float" },
                ]
            }
        }
    },
    {
        name: "bullets", type: {
            type: "map",
            values: {
                name: "Bullet",
                type: "record",
                fields: [
                    { name: "state", type: "int" },
                    { name: "x", type: "float" },
                    { name: "y", type: "float" }
                ]
            }
        }
    },
    {
        name: "scoreboard", type: {
            type: "map",
            values: {
                name: "Score",
                type: "record",
                fields: [
                    { name: "nickname", type: "string" },
                    { name: "score", type: "long" }
                ]
            }
        }
    }
]
export const gameUpdateType = avro.parse<GameUpdate>({
    type: "record",
    name: "GameUpdate",
    fields: gameUpdateFields
});

export type FullGameUpdate = {
    topic: ServerTopic.FullGameUpdate
} & GameUpdate;

export const fullGameUpdateType = avro.parse<FullGameUpdate>({
    type: "record",
    name: "FullGameUpdate",
    fields: [
        { name: "topic", type: "int" },
        ...gameUpdateFields
    ]
});

export type PartialGameUpdate = {
    topic: ServerTopic.PartialGameUpdate
    data: ArrayBufferLike
};

export const partialGameUpdateType = avro.parse<PartialGameUpdate>({
    type: "record",
    name: "PartialGameUpdate",
    fields: [
        { name: "topic", type: "int" },
        { name: "data", type: 'bytes' }
    ]
});

export type Destroyed = {
    topic: ServerTopic.Destroyed
    byWhom: string
}

export const destroyedType = avro.parse<Destroyed>({
    type: "record",
    name: "ScoreUpdate",
    fields: [
        { name: "topic", type: "int" },
        { name: "byWhom", type: "string" },
    ]
});