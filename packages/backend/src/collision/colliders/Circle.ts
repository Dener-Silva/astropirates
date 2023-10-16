import { circleVsPointSAT, circleVsPolygonSAT } from "../SAT.js";
import { Collider, AABB, ObjectWithCollider } from "./Collider.js";
import { Point } from "./Point.js";
import { Polygon } from "./Polygon.js";

export class Circle implements Collider {

    enabled = true;
    x = 0;
    y = 0;
    rotation = 0;
    owner?: ObjectWithCollider | undefined;

    constructor(public radius: number) { }

    collidesWith(collider: Collider): boolean {
        if (collider instanceof Circle) {
            return Math.hypot(this.x - collider.x, this.y - collider.y) <= this.radius + collider.radius;
        } else if (collider instanceof Point) {
            return circleVsPointSAT(this, collider);
        } else if (collider instanceof Polygon) {
            return circleVsPolygonSAT(this, collider);
        }
        throw new Error(`Collider of unknown type: ${collider.constructor.name}`)
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
