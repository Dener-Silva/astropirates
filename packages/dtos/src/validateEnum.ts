
export function validateEnum<T extends { [key: number]: string; }>(enum_: T, value: number): T[keyof T] {
    if (!(value in enum_)) {
        throw new Error(`Invalid value: ${value}`);
    }
    return value as T[keyof T];
}
