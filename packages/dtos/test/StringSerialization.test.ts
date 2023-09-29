import { deserializeString, getByteLength, serializeString } from "../src/StringSerialization.js";
import { Serializable } from "./ByteLengthCustomMatcher.js";
import avro from 'avro-js';

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
    const buffer = new ArrayBuffer(getByteLength(str));
    const dataView = new DataView(buffer);

    serializeString(0, str, dataView);
    const [result, byteLength] = deserializeString(0, dataView);

    expect(result).toEqual(str);
    expect(byteLength).toEqual(getByteLength(str));
});

test.each([
    'Happy String',
    '',
    'String with emoji 🙂',
    'Japanese characters 夜を待つよ',
])('Compare before and after serialization', (str) => {
    const type = avro.parse({ type: "string" });

    const buf = type.toBuffer(str);
    const result = type.fromBuffer(buf);

    console.log(new Int8Array(buf).length, getByteLength(str));

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
    const type = avro.parse({ type: "string" });

    const buf = type.toBuffer(str);
    const result = type.fromBuffer(buf);

    console.log(new Int8Array(buf).length, getByteLength(str));

    expect(result).toEqual(str);
});
