import { Serializable } from "./ByteLengthCustomMatcher.js";

test('checkByteLength should pass', () => {
    const objectUnderTest: Serializable = {
        byteLength: 2,
        serialize: (dataView) => {
            dataView.setUint16(0, 65535)
        }
    }

    expect(objectUnderTest).toHaveAccurateByteLength();
});

test('checkByteLength should fail, length too short', () => {
    const objectUnderTest: Serializable = {
        byteLength: 1,
        serialize: (dataView) => {
            dataView.setUint16(0, 65535)
        }
    }

    expect(objectUnderTest).not.toHaveAccurateByteLength();
});

test('checkByteLength should fail, length too long', () => {
    const objectUnderTest: Serializable = {
        byteLength: 3,
        serialize: (dataView) => {
            dataView.setUint16(0, 65535)
        }
    }

    expect(objectUnderTest).not.toHaveAccurateByteLength();
});

test('checkByteLength should fail, hole in data', () => {
    const objectUnderTest: Serializable = {
        byteLength: 3,
        serialize: (dataView) => {
            dataView.setUint8(0, 123)
            dataView.setUint8(2, 123)
        }
    }

    expect(objectUnderTest).not.toHaveAccurateByteLength();
});

test('checkByteLength should fail, two holes in data', () => {
    const objectUnderTest: Serializable = {
        byteLength: 4,
        serialize: (dataView) => {
            dataView.setUint8(0, 123)
            dataView.setUint8(3, 123)
        }
    }

    expect(objectUnderTest).not.toHaveAccurateByteLength();
});