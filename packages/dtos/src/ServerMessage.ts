import avro from 'avro-js';

export enum ServerTopic {
    Welcome,
    NicknameAlreadyExists,
    NewPlayer,
    GameUpdate,
    Destroyed,
}

export type PlayerAttributes = { nickname: string }
export type Welcome = {
    topic: ServerTopic.Welcome
    id: string
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
        { name: "id", type: "string" },
        { name: "tickrate", type: "double" },
        {
            name: "players", type: {
                type: "map",
                values: playerAttributesSchema
            }
        }
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
export type Player = { state: GameObjectState, x: number, y: number, rotation: number, score: number }
export type Bullet = { state: GameObjectState, x: number, y: number }
export type Dictionary<T> = { [id: string]: T }
export type GameUpdate = {
    topic: ServerTopic.GameUpdate
    players: Dictionary<Player>
    bullets: Dictionary<Bullet>
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
                        { name: "state", type: "int" },
                        { name: "x", type: "float" },
                        { name: "y", type: "float" },
                        { name: "rotation", type: "float" },
                        { name: "score", type: "int" },
                    ]
                }
            }
        },
        {
            name: "bullets", type: {
                type: "map",
                values: {
                    name: "Bullets",
                    type: "record",
                    fields: [
                        { name: "state", type: "int" },
                        { name: "x", type: "float" },
                        { name: "y", type: "float" }
                    ]
                }
            }
        }
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