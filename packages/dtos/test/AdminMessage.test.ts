import { toBeDeepCloseTo } from "jest-matcher-deep-close-to";
import { AdminTopic, SetAiParameters, setAiParametersType } from "../src/AdminMessage.js";
expect.extend({ toBeDeepCloseTo });

test('Compare before and after serialization (SetAiParameters)', () => {
    const input: SetAiParameters = {
        topic: AdminTopic.SetAiParameters,
        reactionTime: 500,
        idleSpeed: 0.1,
        idleAngularVelocity: 0.01,
        chasingAISpeedMultiplier: 0.5,
        chasingPlayerSpeedMultiplier: 0.75,
        chasingAngularVelocity: 0.1,
        aiVisionDistance: 300,
        quantity: 3
    }

    const buffer = setAiParametersType.toBuffer(input);
    const result = setAiParametersType.fromBuffer(buffer);

    expect(result).toBeDeepCloseTo(input);
});

test.each([
    [1, 2],
    [0, -1],
])('Should limit to %i', (limit: number, value: number) => {
    const input: SetAiParameters = {
        topic: AdminTopic.SetAiParameters,
        reactionTime: 500,
        idleSpeed: value,
        idleAngularVelocity: value,
        chasingAISpeedMultiplier: value,
        chasingPlayerSpeedMultiplier: value,
        chasingAngularVelocity: value,
        aiVisionDistance: 300,
        quantity: 3
    }

    const buffer = setAiParametersType.toBuffer(input);
    const result = setAiParametersType.fromBuffer(buffer);

    expect(result.idleSpeed).toEqual(limit);
    expect(result.idleAngularVelocity).toEqual(limit);
    expect(result.chasingAISpeedMultiplier).toEqual(limit);
    expect(result.chasingPlayerSpeedMultiplier).toEqual(limit);
    expect(result.chasingAngularVelocity).toEqual(limit);
});

test.each([
    [100, 101],
    [0, -1],
])('Should limit to %i', (limit: number, value: number) => {
    const input: SetAiParameters = {
        topic: AdminTopic.SetAiParameters,
        reactionTime: 500,
        idleSpeed: 0.1,
        idleAngularVelocity: 0.01,
        chasingAISpeedMultiplier: 0.5,
        chasingPlayerSpeedMultiplier: 0.75,
        chasingAngularVelocity: 0.1,
        aiVisionDistance: 300,
        quantity: value
    }

    const buffer = setAiParametersType.toBuffer(input);
    const result = setAiParametersType.fromBuffer(buffer);

    expect(result.quantity).toEqual(limit);
});