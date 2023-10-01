declare module "avro-js" {
    export const parse: <T>(schema: any, opts?: any) => Type<T>;

    export type Type<T> = {
        toBuffer: (obj: T, resolver?: any) => ArrayBufferLike
        fromBuffer: (buffer: ArrayBufferLike, resolver?: any, noCheck?: boolean) => T
        isValid: (obj: T) => boolean
        createResolver: (type: Type) => any
        random: () => T
    }

    export type Tap = {
        pos: number
        skipLong: () => void
        readLong: () => number
        writeLong: (value: number) => void
        skipInt: () => void
        readInt: () => number
        writeInt: (value: number) => void
        readString: () => string
        skipString: () => void
    }

    export namespace types {
        export class LogicalType<T> {
            constructor(attrs: any, opts?: any, Types?: any[])
            _values: any
            _underlyingType: any
            _toValue(value: T): T
            _fromValue(value: T): T
            _read(tap: Tap): T
            _skip(tap: Tap): void
            _read(tap: Tap): T
            _write(tap: Tap, val: T): void
        }
    }
}