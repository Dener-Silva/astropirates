import { Input, InputTypes } from "../../src/client/Input.js";

test.each([
    InputTypes.StartShooting,
    InputTypes.StopShooting,
    InputTypes.Move
])('Check byteLength', (inputType) => {
    const input = new Input(inputType, 25);
    expect(input).toHaveAccurateByteLength();
});

test.each([
    new Input(InputTypes.StartShooting, 25),
    new Input(InputTypes.StopShooting, 25),
    (() => {
        const input = new Input(InputTypes.Move, 25);
        input.angle = 123;
        input.magnitude = 0.1;
        return input;
    })(),
])('Compare before and after serialization', (input) => {
    const buffer = new ArrayBuffer(input.byteLength);
    const dataView = new DataView(buffer);

    input.serialize(dataView);
    const result = Input.deserialize(dataView);

    expect(input).toEqual(result);
});

test('Ignore magnitude greater than 1', () => {
    const input = new Input(InputTypes.Move, 25);
    input.angle = 123;
    input.magnitude = 1.1;
    const buffer = new ArrayBuffer(input.byteLength);
    const dataView = new DataView(buffer);

    input.serialize(dataView);
    const result = Input.deserialize(dataView);

    expect(result.magnitude).toEqual(1);
});

test('Fail with unknown input type', () => {
    const input = new Input(255 as any, 25);
    const buffer = new ArrayBuffer(input.byteLength);
    const dataView = new DataView(buffer);

    input.serialize(dataView);

    expect(() => Input.deserialize(dataView)).toThrow();
});