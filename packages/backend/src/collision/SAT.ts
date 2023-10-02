import { Point } from "./colliders/Point.js";
import { Polygon } from "./colliders/Polygon.js";
import { projectPolygonOnAxis, projectPointOnAxis } from "./Projections.js";
import { normal, overlaps } from "./VectorFunctions.js";
import { Vector } from "./VectorFunctions.js";

export function polygonVsPolygonSAT(a: Polygon, b: Polygon) {
    for (let i = 0; i < b.points.length; i += 2) {
        const lineSegmentX1 = b.points[i];
        const lineSegmentY1 = b.points[i + 1];
        const lineSegmentX2 = b.points[(i + 2) % b.points.length];
        const lineSegmentY2 = b.points[(i + 3) % b.points.length];

        // vector representing the slope of the line segment
        const axis: Vector = [lineSegmentX2 - lineSegmentX1, lineSegmentY2 - lineSegmentY1];
        // We get the normal axis
        normal(axis);
        // Then we project the polygons on the axis. No need to normalize
        const projectedA = projectPolygonOnAxis(a, axis);
        const projectedB = projectPolygonOnAxis(b, axis);

        if (!overlaps(projectedA, projectedB)) {
            return false;
        }
    }

    return true;
}

export function pointVsPolygonSAT(a: Point, b: Polygon) {
    for (let i = 0; i < b.points.length; i += 2) {
        const lineSegmentX1 = b.points[i];
        const lineSegmentY1 = b.points[i + 1];
        const lineSegmentX2 = b.points[(i + 2) % b.points.length];
        const lineSegmentY2 = b.points[(i + 3) % b.points.length];

        // Vector representing the slope of the line segment
        const axis: Vector = [lineSegmentX2 - lineSegmentX1, lineSegmentY2 - lineSegmentY1];
        // We get the normal axis
        normal(axis);
        // Then we project the polygon on the axis. No need to normalize
        const projectedA = projectPointOnAxis(a, axis);
        const projectedB = projectPolygonOnAxis(b, axis);

        if (!overlaps(projectedA, projectedB)) {
            return false;
        }
    }

    return true;
}
