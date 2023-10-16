import avro from 'avro-js';

export enum ClientTopic {
    "SetNickname",
    "Input"
}

export type SetNickname = {
    topic: ClientTopic.SetNickname
    nickname: string
}

class Maxlength15 extends avro.types.LogicalType<string> {
    constructor(attrs: any, opts?: any, Types?: any[]) {
        super(attrs, opts, Types);
    }

    _toValue(value: string) {
        return value.substring(0, 15);
    }

    _fromValue(value: string) {
        return value.substring(0, 15).trim();
    }
}

export const setNicknameType = avro.parse<SetNickname>({
    type: "record",
    name: "SetNickname",
    fields: [
        { name: "topic", type: "int" },
        { name: "nickname", type: { type: "string", logicalType: 'maxlength-15' } },
    ]
}, { logicalTypes: { 'maxlength-15': Maxlength15 } });

export type Input = {
    topic: ClientTopic.Input
    angle: number
    magnitude: number
    shoot: boolean
}

class Clamp0To1 extends avro.types.LogicalType<number> {
    constructor(attrs: any, opts?: any, Types?: any[]) {
        super(attrs, opts, Types);
    }

    _toValue(value: number) {
        return value;
    }

    _fromValue(value: number) {
        return Math.min(1, Math.max(0, value));
    }
}

export const inputType = avro.parse<Input>({
    type: "record",
    name: "Input",
    fields: [
        { name: "topic", type: "int" },
        { name: "angle", type: "float" },
        { name: "magnitude", type: { type: "float", logicalType: 'clamp-0-to-1' } },
        { name: "shoot", type: "boolean" },
    ]
}, { logicalTypes: { 'clamp-0-to-1': Clamp0To1 } });
