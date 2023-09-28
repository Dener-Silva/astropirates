export class NeverError extends Error {
    constructor(_never: never, message?: string) {
        super(message);
    }
}
