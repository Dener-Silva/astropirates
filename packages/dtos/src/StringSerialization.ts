/**
 * Calculate the number of bytes the string will use after serialization. This
 * includes 1 extra byte at the start of the string to represent the byte count.
 * Since the prefix is only 1 byte long, the maximum string length is 255 bytes.
 * @param str String to be measured
 * @returns Byte length after serialization
 */
export function getByteLength(str: string): number {
    return Math.min(new TextEncoder().encode(str).byteLength, 255) + 1;
}

/**
 * Serialize the string into the target buffer. This includes 1 extra byte at
 * the start of the string to represent the byte count. Since the prefix is
 * only 1 byte long, the maximum string length is 255 bytes. Longer strings
 * will be truncated.
 * @param byteOffset Offset on target DataView
 * @param str String to be serialized
 * @param target DataView to write the data into
 * @returns Byte length after serialization, including 1-byte length prefix
 */
export function serializeString(byteOffset: number, str: string, target: DataView): number {
    // Strings greater than 255 bytes get truncated to avoid overwriting memory
    const encoded = new TextEncoder().encode(str).subarray(0, 255);
    const targetArray = new Uint8Array(target.buffer, target.byteOffset + byteOffset);
    // 1 byte Pascal-style run length
    targetArray[0] = encoded.byteLength;
    targetArray.set(encoded, 1);
    return encoded.byteLength + 1;
}

/**
 * Read string from source DataView.
 * @param source DataView to read from
 * @param byteOffset Offset on source DataView
 * @returns Decoded string
 */
export function deserializeString(byteOffset: number, source: DataView): string {
    const runLength = source.getInt8(byteOffset);
    const sourceArray = new Uint8Array(source.buffer, source.byteOffset + byteOffset + 1, runLength);
    return new TextDecoder().decode(sourceArray);
}