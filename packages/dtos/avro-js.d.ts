declare module "avro-js" {
    export const parse: <T>(schema: any, opts?: any) => Type<T>;

    export type Type<T> = {
        toBuffer: (obj: T, resolver?: any) => Buffer
        fromBuffer: (buffer: Buffer, resolver?: any, noCheck?: boolean) => T
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
        readBoolean: () => boolean
        skipBoolean: () => void
        writeBoolean: (value: boolean) => void
    }

    export namespace types {
        export class LogicalType<T, V = T> {
            constructor(attrs: any, opts?: any, Types?: any[])
            _values: any
            _underlyingType: any
            _toValue(value: T): V
            _fromValue(value: V): T
            _read(tap: Tap): V
            _skip(tap: Tap): void
            _write(tap: Tap, val: V): void
        }
    }
}