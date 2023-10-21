import avro from 'avro-js';

export enum ServerTopic {
    Welcome,
    GameUpdate,
    FullGameUpdate,
    PartialGameUpdate,
    NicknameAlreadyExists,
    Destroyed,
    Leaderboard,
    InvalidateLeaderboardCache,
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
    delta: any
};

export const partialGameUpdateType = avro.parse<PartialGameUpdate>({
    type: "record",
    name: "PartialGameUpdate",
    fields: [
        { name: "topic", type: "int" },
        { name: "delta", type: 'bytes' }
    ]
});

class BigintType extends avro.types.LogicalType<bigint, number> {
    _fromValue(val: number) { return BigInt(val); };
    _toValue(big: bigint) { return Number(big); };
}

export type Destroyed = {
    topic: ServerTopic.Destroyed
    byWhom: string
    rowNumber: bigint
    rowId: bigint
}

export const destroyedType = avro.parse<Destroyed>({
    type: "record",
    name: "Destroyed",
    fields: [
        { name: "topic", type: "int" },
        { name: "byWhom", type: "string" },
        { name: "rowId", type: { type: "long", logicalType: "bigint" } },
        { name: "rowNumber", type: { type: "long", logicalType: "bigint" } },
    ]
}, { logicalTypes: { "bigint": BigintType } });

class DateType extends avro.types.LogicalType<Date, number> {
    _fromValue(val: number) { return new Date(val); };
    _toValue(date: Date) { return +date; };
}

export type LeaderboardRow = { id: bigint, name: string, score: bigint, ts: Date, rank: bigint }
export type Leaderboard = {
    topic: ServerTopic.Leaderboard
    offset: number
    rows: LeaderboardRow[]
    count: bigint
}

export const leaderboardType = avro.parse<Leaderboard>({
    name: "Leaderboard",
    type: "record",
    fields: [
        { name: "topic", type: "int" },
        { name: "offset", type: "int" },
        {
            name: "rows",
            type: {
                type: "array",
                items: {
                    name: "LeaderboardRow",
                    type: "record",
                    fields: [
                        { name: "id", type: { type: "long", logicalType: "bigint" } },
                        { name: "name", type: "string" },
                        { name: "score", type: { type: "long", logicalType: "bigint" } },
                        { name: 'ts', type: { type: "long", logicalType: "timestamp-millis" } },
                        { name: 'rank', type: { type: "long", logicalType: "bigint" } }
                    ]
                }
            }
        },
        { name: "count", type: { type: "long", logicalType: "bigint" } }
    ]
}, { logicalTypes: { "timestamp-millis": DateType, "bigint": BigintType } });