import { ClientTopic, Input } from 'dtos';

const input: Input = {
    topic: ClientTopic.Input,
    angle: 0,
    magnitude: 0,
    shoot: false
};

let didShoot = false;

export function getInput(): Input {
    if (didShoot) {
        didShoot = false;
        return {
            ...input,
            shoot: true
        };
    }
    return input;
}

export function onPointerMove(e: PointerEvent) {
    // Mouse inputs will be processed as if it was an analog controller stick.

    // Get distance to center of the screen
    let mouseDistanceX = e.pageX - window.innerWidth / 2;
    let mouseDistanceY = window.innerHeight / 2 - e.pageY; // Invert Y axis

    // Get the raduis of the largest circle that can be inscribed on the screen
    let maxDistance = Math.min(window.innerWidth, window.innerHeight) / 2

    // Magnitude is the ratio between the distance to the center
    // and the raduis of the largest circle that can be inscribed on the screen.
    let mouseDistance = Math.hypot(mouseDistanceX, mouseDistanceY);
    input.magnitude = Math.min(mouseDistance / maxDistance, 1);
    input.angle = Math.atan2(mouseDistanceY, mouseDistanceX);
    return input;
}

export function onMouseDown() {
    didShoot = true;
    input.shoot = true;
}

export function onMouseUp() {
    input.shoot = false;
}
