import avro from 'avro-js';

export enum AdminTopic {
    SetAiParameters,
    ResetAiParameters,
    KillBots
}

export type SetAiParameters = {
    topic: AdminTopic.SetAiParameters
    reactionTime: number
    idleSpeed: number
    idleAngularVelocity: number
    chasingAISpeedMultiplier: number
    chasingPlayerSpeedMultiplier: number
    chasingAngularVelocity: number
    aiVisionDistance: number
    quantity: number
}

class Clamp0To1 extends avro.types.LogicalType<number> {
    constructor(attrs: any, opts?: any, Types?: any[]) {
        super(attrs, opts, Types);
    }

    _toValue(value: number): number {
        return value;
    }

    _fromValue(value: number) {
        return Math.min(1, Math.max(0, value));
    }
}

class Clamp0To100 extends avro.types.LogicalType<number> {
    constructor(attrs: any, opts?: any, Types?: any[]) {
        super(attrs, opts, Types);
    }

    _toValue(value: number): number {
        return value;
    }

    _fromValue(value: number) {
        return Math.max(Math.min(value, 100), 0);
    }
}

export const setAiParametersType = avro.parse<SetAiParameters>({
    type: "record",
    name: "SetAiParameters",
    fields: [
        { name: "topic", type: "int" },
        { name: "reactionTime", type: "int" },
        { name: "idleSpeed", type: { type: "double", logicalType: 'clamp-0-to-1' } },
        { name: "idleAngularVelocity", type: { type: "double", logicalType: 'clamp-0-to-1' } },
        { name: "chasingAISpeedMultiplier", type: { type: "double", logicalType: 'clamp-0-to-1' } },
        { name: "chasingPlayerSpeedMultiplier", type: { type: "double", logicalType: 'clamp-0-to-1' } },
        { name: "chasingAngularVelocity", type: { type: "double", logicalType: 'clamp-0-to-1' } },
        { name: "aiVisionDistance", type: "int" },
        { name: "quantity", type: { type: "int", logicalType: 'clamp-0-to-100' } },
    ]
}, { logicalTypes: { 'clamp-0-to-1': Clamp0To1, 'clamp-0-to-100': Clamp0To100 } });
