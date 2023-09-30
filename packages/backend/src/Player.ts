import { Input, rotateTowards } from "dtos"
import { delta } from './delta.js';

const maxRotationSpeed = 0.01;
const dragCoefficient = 0.01;
const maxForce = 0.002;

export class Player {

    x: number
    y: number
    xSpeed = 0
    ySpeed = 0
    rotation = Math.PI / 2;

    constructor(public nickname: string) {
        // TODO random position
        this.x = this.y = 0
    }

    move(input: Input) {
        // Rotate
        // Remember that on Pixi the world coordinates are inverted on the Y axis
        this.rotation = rotateTowards(this.rotation, input.angle, maxRotationSpeed * delta);

        // Calculate speed
        let xDrag = dragCoefficient * Math.abs(this.xSpeed) * this.xSpeed;
        let yDrag = dragCoefficient * Math.abs(this.ySpeed) * this.ySpeed;
        let xForce = maxForce * input.magnitude * Math.cos(this.rotation);
        let yForce = maxForce * input.magnitude * Math.sin(this.rotation);
        this.xSpeed += (xForce - xDrag) * delta;
        this.ySpeed += (yForce - yDrag) * delta;

        // Move forward
        this.x += this.xSpeed * delta;
        this.y += this.ySpeed * delta;
    }
}
