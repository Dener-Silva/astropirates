export type Serializable = {
    byteLength: number
    serialize: (dataView: DataView) => void
};

expect.extend({
    toHaveAccurateByteLength(objectUnderTest: Serializable) {
        const buffer = new ArrayBuffer(objectUnderTest.byteLength);
        const dataView = new DataView(buffer);

        // Here we fill the buffer with 1s before serializing
        const typedArray = new Uint8Array(buffer);
        typedArray.fill(255);
        // First serialization might fail with RangeError.
        try {
            objectUnderTest.serialize(dataView);
        } catch (e) {
            if (e instanceof RangeError) {
                return {
                    message: () => `Object tried to write outside of its byteLength`,
                    pass: false,
                };
            }
        }
        const resultWithFs = new Uint8Array(typedArray);

        // Fill the buffer with 0s before serializing to check the difference
        typedArray.fill(0);
        objectUnderTest.serialize(dataView);
        const resultWith0s = new Uint8Array(typedArray);

        let startIndex = 0;
        let endIndex = 0;
        let measuredLength = 0;
        const holes = [];
        // Start from the beginning until we find equal bits.
        // That's when we know it was touched by serialization.
        for (let i = 0; i < typedArray.length; i++) {
            if (resultWithFs[i] === resultWith0s[i]) {
                startIndex = i;
                break;
            }
        }
        // Start from the end until we find equal bits.
        for (let i = typedArray.length - 1; i >= 0; i--) {
            if (resultWithFs[i] === resultWith0s[i]) {
                endIndex = i + 1;
                break;
            }
        }
        // Search range for holes untouched by serialization.
        for (let i = startIndex; i < endIndex; i++) {
            if (resultWithFs[i] === resultWith0s[i]) {
                measuredLength++;
            } else {
                holes.push(i);
            }
        }

        const problems: string[] = [];
        if (startIndex === 1) {
            problems.push(`Serialization has 1 byte offset (should start at 0)`);
        }
        if (startIndex > 1) {
            problems.push(`Serialization has ${startIndex} bytes offset (should start at 0)`);
        }
        if (holes.length === 1) {
            problems.push(`Serialization has a hole at index ${holes[0]}`);
        }
        if (holes.length > 1) {
            problems.push(`Serialization has holes at indices ${holes}`);
        }
        if (objectUnderTest.byteLength !== measuredLength) {
            problems.push(`Object's byteLength is incorrect (it is ${objectUnderTest.byteLength}, but was measured to be ${measuredLength})`);
        }

        return {
            message: () => problems.join('\n'),
            pass: !problems.length,
        };
    }
})

declare global {
    namespace jest {
        interface Matchers<R> {
            toHaveAccurateByteLength(): CustomMatcherResult;
        }
    }
}
