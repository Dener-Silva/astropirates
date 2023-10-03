import { GameObjectState } from "dtos";
import { Collider, ObjectWithCollider } from "./collision/colliders/Collider.js";
import { delta } from "./delta.js";
import { Player } from "./Player.js";

export type PositionAndSpeed = {
    x: number
    y: number
    xSpeed: number
    ySpeed: number
}

export const bulletSpeed = 0.5
const bulletDistance = 300
const bulletTimeToLive = bulletDistance / bulletSpeed;

export class Bullet implements ObjectWithCollider {

    state = GameObjectState.Active;
    x: number
    y: number
    xSpeed: number
    ySpeed: number
    timeLeft = bulletTimeToLive;

    constructor(positionAndSpeed: PositionAndSpeed, public collider: Collider, public owner: Player) {
        this.collider.x = this.x = positionAndSpeed.x;
        this.collider.y = this.y = positionAndSpeed.y;
        this.xSpeed = positionAndSpeed.xSpeed;
        this.ySpeed = positionAndSpeed.ySpeed;
        collider.owner = this;
    }

    update() {
        this.timeLeft -= delta;
        if (this.timeLeft <= 0) {
            this.state = GameObjectState.Expired;
        }

        // Move forward
        this.collider.x = this.x += this.xSpeed * delta;
        this.collider.y = this.y += this.ySpeed * delta;
    }

    onCollision(other?: ObjectWithCollider): void {
        if (other instanceof Player && other === this.owner) {
            return;
        }
        this.state = GameObjectState.Exploded;
        return;
    }
}