declare module "avro-js" {
    export const parse: <T>(schema: any, opts?: any) => Type<T>;

    export type Type<T> = {
        toBuffer: (obj: T, resolver?: any) => ArrayBufferLike
        fromBuffer: (buffer: ArrayBufferLike, resolver?: any, noCheck?: boolean) => T
        isValid: (obj: T) => boolean
        createResolver: (type: Type) => any
        random: () => T
    }

    export namespace types {
        export class LogicalType<T> {
            constructor(attrs: any, opts?: any, Types?: any[])
            _toValue(value: T): T
            _fromValue(value: T): T
        }
    }
}