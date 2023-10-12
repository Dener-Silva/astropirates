import { ClientTopic, Input } from 'dtos';

export class InputSystem {

    private input: Input = {
        topic: ClientTopic.Input,
        angle: 0,
        magnitude: 0,
        shoot: false
    };
    private didShoot = false;

    inputChanged = false;

    getInput(): Input {
        if (this.didShoot) {
            this.didShoot = false;
            return {
                ...this.input,
                shoot: true
            };
        }
        this.inputChanged = false;
        return this.input;
    }

    onPointerMove(e: PointerEvent) {
        this.inputChanged = true;

        // Mouse inputs will be processed as if it was an analog controller stick.

        // Get distance to center of the screen
        // All coordinates on this app are inverted on the Y axis
        let mouseDistanceX = e.pageX - window.innerWidth / 2;
        let mouseDistanceY = e.pageY - window.innerHeight / 2;

        // Get the raduis of the largest circle that can be inscribed on the screen
        let maxDistance = Math.min(window.innerWidth, window.innerHeight) / 2

        // Magnitude is the ratio between the distance to the center
        // and the raduis of the largest circle that can be inscribed on the screen.
        let mouseDistance = Math.hypot(mouseDistanceX, mouseDistanceY);
        this.input.magnitude = Math.min(mouseDistance / maxDistance, 1);
        this.input.angle = Math.atan2(mouseDistanceY, mouseDistanceX);
        return this.input;
    }

    onMouseDown() {
        this.inputChanged = true;
        this.didShoot = true;
        this.input.shoot = true;
    }

    onMouseUp() {
        this.inputChanged = true;
        this.input.shoot = false;
    }
}

