import { Point } from "./colliders/Point.js";
import { Polygon } from "./colliders/Polygon.js";
import { Vector } from "./VectorFunctions.js";
import { dot } from "./VectorFunctions.js";

export function projectPolygonOnAxis(polygon: Polygon, axis: Vector): Vector {
    let min = Infinity;
    let max = -Infinity;
    for (let ix = 0, iy = 1; ix < polygon.points.length; ix += 2, iy += 2) {
        const x = polygon.points[ix];
        const y = polygon.points[iy];
        const projected = dot(axis, x, y);
        min = Math.min(min, projected);
        max = Math.max(max, projected);
    }
    return [min, max];
}

export function projectPointOnAxis(point: Point, axis: Vector): Vector {
    const projectedPoint = dot(axis, point.x, point.y);
    return [projectedPoint, projectedPoint];
}
