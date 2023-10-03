import { Collider, AABB, ObjectWithCollider } from "./Collider.js";

export class Circle implements Collider {

    enabled = true;
    x = 0;
    y = 0;
    rotation = 0;
    owner?: ObjectWithCollider | undefined;

    constructor(public radius: number) { }

    collidesWith(_collider: Collider): boolean {
        throw new Error("Method not implemented.");
    }

    public get aabb(): AABB {
        return {
            minX: this.x - this.radius,
            maxX: this.x + this.radius,
            minY: this.y - this.radius,
            maxY: this.y + this.radius
        }
    }
}
