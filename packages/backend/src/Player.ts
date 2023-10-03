import { GameObjectState, Input, rotateTowards } from "dtos"
import { delta } from './delta.js';
import { Polygon } from "./collision/colliders/Polygon.js";
import { ObjectWithCollider } from "./collision/colliders/Collider.js";
import { Bullet, PositionAndSpeed, bulletSpeed } from "./Bullet.js";
import { Point } from "./collision/colliders/Point.js";

const maxRotationSpeed = 0.01;
const dragCoefficient = 0.01;
const maxForce = 0.002;

/**
 * Measured in milliseconds
 */
const shootCoolDown = 200;

export class Player implements ObjectWithCollider {

    state = GameObjectState.Active;
    x: number
    y: number
    xSpeed = 0
    ySpeed = 0
    rotation = Math.PI / 2;
    shootTimer = 0;

    constructor(public nickname: string, public collider: Polygon) {
        collider.owner = this;
        // TODO random position. Do not forget to update collider
        this.x = this.y = 0
    }

    update() {
        this.shootTimer -= delta
    }

    move(input: Input) {
        // Rotate
        // All coordinates on this app are inverted on the Y axis
        this.collider.rotation = this.rotation = rotateTowards(this.rotation, input.angle, maxRotationSpeed * delta);

        // Calculate speed
        let xDrag = dragCoefficient * Math.abs(this.xSpeed) * this.xSpeed;
        let yDrag = dragCoefficient * Math.abs(this.ySpeed) * this.ySpeed;
        let xForce = maxForce * input.magnitude * Math.cos(this.rotation);
        let yForce = maxForce * input.magnitude * Math.sin(this.rotation);
        this.xSpeed += (xForce - xDrag) * delta;
        this.ySpeed += (yForce - yDrag) * delta;

        // Move forward
        this.collider.x = this.x += this.xSpeed * delta;
        this.collider.y = this.y += this.ySpeed * delta;
    }

    onCollision(other: ObjectWithCollider): void {
        if (other instanceof Bullet) {
            if (other.owner !== this) {
                this.state = GameObjectState.Exploded;
            }
            return;
        } else if (other instanceof Player) {
            return;
        }
        throw new Error(`Collided with object of unknown type: ${other.constructor.name}`);
    }

    get canShoot(): boolean {
        return this.shootTimer <= 0;
    }

    shoot(): Bullet {
        this.shootTimer = shootCoolDown;

        const positionAndSpeed: PositionAndSpeed = {
            x: this.x + 45 * Math.cos(this.rotation),
            y: this.y + 45 * Math.sin(this.rotation),
            xSpeed: this.xSpeed + Math.cos(this.rotation) * bulletSpeed,
            ySpeed: this.ySpeed + Math.sin(this.rotation) * bulletSpeed,
        }

        return new Bullet(positionAndSpeed, new Point(), this);
    }
}
