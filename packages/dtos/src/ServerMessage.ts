import avro from 'avro-js';

export enum ServerTopic {
    Welcome,
    GameUpdate,
    FullGameUpdate,
    PartialGameUpdate,
    NicknameAlreadyExists,
    NicknameStartsWithBot,
    Destroyed,
    Leaderboard,
    InvalidateLeaderboardCache,
    Rank,
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

// https://issues.apache.org/jira/browse/AVRO-3902
const longType = avro.types.LongType.using({
    fromBuffer: (buf: any) => buf.readBigInt64LE(),
    toBuffer: (n: bigint) => {
        const buf = Buffer.alloc(8);
        buf.writeBigInt64LE(n);
        return buf;
    },
    fromJSON: BigInt,
    toJSON: Number,
    isValid: (n: bigint) => typeof n === 'bigint',
    compare: (n1: bigint, n2: bigint) => { return n1 === n2 ? 0 : (n1 < n2 ? -1 : 1); }
});

export type Destroyed = {
    topic: ServerTopic.Destroyed
    byWhom: string
}

export const destroyedType = avro.parse<Destroyed>({
    type: "record",
    name: "Destroyed",
    fields: [
        { name: "topic", type: "int" },
        { name: "byWhom", type: "string" }
    ]
});

export type LeaderboardRow = { id: bigint, name: string, score: bigint, rank: bigint }
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
                        { name: "id", type: "long" },
                        { name: "name", type: "string" },
                        { name: "score", type: "long" },
                        { name: 'rank', type: "long" }
                    ]
                }
            }
        },
        { name: "count", type: "long" }
    ]
}, { registry: { long: longType } });

export type Rank = {
    topic: ServerTopic.Rank
    rowNumber: bigint
    rowId: bigint
}

export const rankType = avro.parse<Rank>({
    type: "record",
    name: "Rank",
    fields: [
        { name: "topic", type: "int" },
        { name: "rowId", type: "long" },
        { name: "rowNumber", type: "long" },
    ]
}, { registry: { long: longType } });