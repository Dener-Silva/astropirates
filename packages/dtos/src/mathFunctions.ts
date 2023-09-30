export function lerp(start: number, end: number, factor: number): number {
    return (1 - factor) * start + factor * end;
}

export function angleDistance(angleA: number, angleB: number): number {
    let max = Math.PI * 2;
    let delta = (angleB - angleA) % max;
    return 2 * delta % max - delta;
}

export function angleLerp(start: number, end: number, factor: number): number {
    let delta = angleDistance(start, end);
    return start + delta * factor;
}

export function rotateTowards(from: number, to: number, maxDelta: number): number {
    let delta = angleDistance(from, to);
    delta = Math.max(Math.min(delta, maxDelta), -maxDelta);
    return from + delta;
}

export function restrictBounds(number: number, min: number, max: number): number {
    if (min > max) {
        throw new Error(`Invalid arguments min=${min} max=${max}. Min should be less than Max`);
    }
    let range = max - min;
    return mod(number - min, range) + min;
}

export function distance(x1: number, y1: number, x2: number, y2: number): number {
    let distanceX = x2 - x1;
    let distanceY = y2 - y1;
    return Math.hypot(distanceX, distanceY);
}

/**
 * Arithmetic modulo operation. It is different from the % operator, as the
 * % operator rounds toward zero and this method rounds towards -Infinity.
 * @param {number} x 
 * @param {number} y 
 */
export function mod(x: number, y: number): number {
    return x - y * Math.floor(x / y);
}