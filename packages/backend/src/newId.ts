
let currentId = 0;

function encodeBase94(number: number) {
    const base94Chars = "!\"#$%&'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~";

    if (number === 0) {
        return '!';
    }

    let encoded = "";
    while (number > 0) {
        const remainder = number % 94;
        encoded = base94Chars[remainder] + encoded;
        number = Math.floor(number / 94);
    }

    return encoded;
}

export function newId() {
    // Base94 strings use less bandwidth, but numeric strings might be a little faster
    // Needs more testing to see if the tradeoff is worth it
    return encodeBase94(currentId++);
}