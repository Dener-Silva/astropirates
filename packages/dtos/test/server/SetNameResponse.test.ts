import { SetNameResponse } from "../../src/server/SetNameResponse.js";

test('Check byteLength', () => {
    const setNameResponse = new SetNameResponse(0, 'Technocat', true);
    expect(setNameResponse).toHaveAccurateByteLength();
});

test.each([
    [0, 'Technocat', true],
    [256, 'Rejected Nickname', false]
])('Compare before and after serialization', (id, nickname, success) => {
    const setNameResponse = new SetNameResponse(id, nickname, success);
    const buffer = new ArrayBuffer(setNameResponse.byteLength);
    const dataView = new DataView(buffer);

    setNameResponse.serialize(dataView);
    const result = SetNameResponse.deserialize(dataView);

    expect(setNameResponse).toEqual(result);
});