import { Input, InputTypes } from 'dtos';

const inputQueue: Input[] = [];

export function takeAllFromInputQueue(): Input[] {
    return inputQueue.splice(0);
}

function mapPointerMovement(event: PointerEvent): Input {
    // Mouse inputs will be processed as if it was an analog controller stick.

    // Get distance to center of the screen
    let mouseDistanceX = event.pageX - window.innerWidth / 2;
    let mouseDistanceY = window.innerHeight / 2 - event.pageY; // Invert Y axis

    // Get the raduis of the largest circle that can be inscribed on the screen
    let maxDistance = Math.min(window.innerWidth, window.innerHeight) / 2

    // Magnitude is the ratio between the distance to the center
    // and the raduis of the largest circle that can be inscribed on the screen.
    let mouseDistance = Math.hypot(mouseDistanceX, mouseDistanceY);
    let magnitude = Math.min(mouseDistance / maxDistance, 1);

    let angle = Math.atan2(mouseDistanceY, mouseDistanceX);
    // TODO set time
    const input = new Input(InputTypes.Move, 0);
    input.angle = angle;
    input.magnitude = magnitude;
    return input;
}

export function onPointerMove(e: PointerEvent) {
    inputQueue.push(mapPointerMovement(e));
}

export function onMouseDown() {
    inputQueue.push(new Input(InputTypes.StartShooting, 0));
}

export function onMouseUp() {
    inputQueue.push(new Input(InputTypes.StopShooting, 0));
}
