import { pointVsPolygonSAT, polygonVsPolygonSAT } from "../SAT.js";
import { Collider, AABB } from "./Collider.js";
import { Point } from "./Point.js";

export class Polygon implements Collider {

    enabled = true;
    private _x = 0;
    private _y = 0;
    private _rotation = 0;
    private radius: number;
    // Optimization: Points are cached for better performance.
    // They need to be recalculated every time x, y or rotation are changed.
    private needsRecalcualtion = true;

    constructor(private _points: number[]) {
        if (_points.length % 2) {
            throw new Error(`Points array size should be multiple of two. The actual size is ${_points.length}.`)
        }
        this.radius = this.getRadius(_points);
    }

    private getRadius(points: number[]) {
        let radius = 0;
        for (let ix = 0, iy = 1; ix < points.length; ix += 2, iy += 2) {
            let distance = Math.hypot(points[ix], points[iy]);
            radius = Math.max(radius, distance);
        }
        return radius;
    }

    set x(x: number) {
        this._x = x;
        this.needsRecalcualtion = true;
    }

    get x(): number {
        return this._x;
    }

    set y(y: number) {
        this._y = y;
        this.needsRecalcualtion = true;
    }

    get y(): number {
        return this._y;
    }

    set rotation(radians: number) {
        this._rotation = radians % (Math.PI * 2);
        this.needsRecalcualtion = true;
    }

    get rotation(): number {
        return this._rotation;
    }

    get points() {
        if (this.needsRecalcualtion) {
            this.recalculate();
            this.needsRecalcualtion = false;
        }
        return this._points;
    }

    get aabb(): AABB {
        return {
            minX: this.x - this.radius,
            maxX: this.x + this.radius,
            minY: this.y - this.radius,
            maxY: this.y + this.radius
        }
    }

    private recalculate() {
        const cos = Math.cos(this._rotation);
        const sin = Math.sin(this._rotation);

        // Recalculate points
        for (let ix = 0, iy = 1; ix < this._points.length; ix += 2, iy += 2) {
            // Start at original points
            const originalX = this._points[ix];
            const originalY = this._points[iy];
            // Rotate and translate
            this._points[ix] = (originalX * cos - originalY * sin) + this.x;
            this._points[iy] = (originalX * sin + originalY * cos) + this.y;
        }
    }

    collidesWith(collider: Collider): boolean {
        if (collider instanceof Point) {
            return pointVsPolygonSAT(collider, this);
        }
        else if (collider instanceof Polygon) {
            return polygonVsPolygonSAT(this, collider);
        }
        throw new Error(`Collider of unknown type: ${collider.constructor.name}`)
    }
}
