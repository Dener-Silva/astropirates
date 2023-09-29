import avro from 'avro-js';

export type ClientMessage = {
    topic: ClientTopic,
    [field: string]: any
}

export enum ClientTopic {
    "SetName",
    "Input"
}

export type SetName = {
    topic: ClientTopic.SetName
    nickname: string
}

export const setNameType = avro.parse<SetName>({
    type: "record",
    name: "SetName",
    fields: [
        { name: "topic", type: "int" },
        { name: "nickname", type: "string" },
    ]
});

export type Input = {
    topic: ClientTopic.Input
    angle: number
    magnitude: number
    shoot: boolean
}

export const inputType = avro.parse<Input>({
    type: "record",
    name: "Input",
    fields: [
        { name: "topic", type: "int" },
        { name: "angle", type: "double" },
        { name: "magnitude", type: "double" },
        { name: "shoot", type: "boolean" },
    ]
});
