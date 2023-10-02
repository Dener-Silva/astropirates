import { pointVsPolygonSAT } from "../SAT.js";
import { Collider, AABB } from "./Collider.js";
import { Polygon } from "./Polygon.js";

export class Point implements Collider {
    enabled = true;
    x = 0;
    y = 0;
    rotation = 0;

    public get aabb(): AABB {
        return { minX: this.x, maxX: this.x, minY: this.y, maxY: this.y }
    }

    collidesWith(collider: Collider): boolean {
        if (collider instanceof Point) {
            return collider.x === this.x && collider.y === this.y;
        }
        else if (collider instanceof Polygon) {
            return pointVsPolygonSAT(this, collider);
        }
        throw new Error(`Collider of unknown type: ${collider.constructor.name}`)
    }
}
