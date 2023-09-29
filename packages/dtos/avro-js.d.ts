declare module "avro-js" {
    export const parse: (schema: any, opts?: any) => Type;

    export type Type = {
        toBuffer: (obj: any) => Buffer
        fromBuffer: (buffer: Buffer) => any
        isValid: (obj: any) => boolean
        random: () => any
    }
}