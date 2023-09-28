import { deserializeString, getByteLength, serializeString } from "../src/StringSerialization.js";
import { Serializable } from "./ByteLengthCustomMatcher.js";

test.each([
    'Happy String',
    '',
    'String longer than 255 characters ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~' +
    '~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~' +
    '~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~' +
    '~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~' +
    '~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~',
    'String with emoji 🙂',
    'Japanese characters 夜を待つよ',
])('Check byteLength', (str) => {
    const serializable: Serializable = {
        byteLength: getByteLength(str),
        serialize: d => serializeString(0, str, d),
    };

    expect(serializable).toHaveAccurateByteLength();
});

test.each([
    'Happy String',
    '',
    'String with emoji 🙂',
    'Japanese characters 夜を待つよ',
])('Compare before and after serialization', (str) => {
    const buffer = new ArrayBuffer(256);
    const dataView = new DataView(buffer);

    serializeString(0, str, dataView);
    const result = deserializeString(0, dataView);

    expect(result).toEqual(str);
});

test.each([
    'String longer than 255 characters ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~' +
    '~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~' +
    '~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~' +
    '~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~' +
    '~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~',
    'Long string with emoji 🙂 🙂 🙂 🙂 🙂 🙂 🙂 🙂 🙂 🙂 🙂 🙂 🙂' +
    ' 🙂 🙂 🙂 🙂 🙂 🙂 🙂 🙂 🙂 🙂 🙂 🙂 🙂 🙂 🙂 🙂 🙂 🙂 🙂 🙂' +
    ' 🙂 🙂 🙂 🙂 🙂 🙂 🙂 🙂 🙂 🙂 🙂 🙂 🙂 🙂 🙂'
])('Truncate long string to avoid buffer overflow', (str) => {
    const buffer = new ArrayBuffer(256);
    const array = new Uint8Array(buffer);
    const dataView = new DataView(buffer);

    const result = serializeString(0, str, dataView);

    expect(result).toEqual(256);
    expect(array[0]).toEqual(255);
    const expected = new TextEncoder().encode(str).subarray(0, 255);
    expect(array.subarray(1)).toEqual(expected);
});
