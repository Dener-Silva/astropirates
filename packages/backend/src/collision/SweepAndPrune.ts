import { AABB } from "./colliders/Collider.js";
import { Collider } from "./colliders/Collider.js";

export type ColliderPairs = [Collider, Collider][]

export class SweepAndPrune {

    private colliders: Collider[] = [];

    update(): ColliderPairs {
        // Optimization: The sorted array is reused to take advantage of it being nearly sorted
        this.colliders.sort((a, b) => a.aabb.minX - b.aabb.minX);
        const potentials: ColliderPairs = [];

        const open: Collider[] = [];
        for (const a of this.colliders) {

            if (!a.enabled) {
                continue;
            }

            // Optimization: Store AABB to avoid unnecessary computations
            const a_aabb = a.aabb;
            // Iterate backwards, because we may delete items from 'open'
            for (let i = open.length - 1; i >= 0; i--) {
                const b = open[i];
                const b_aabb = b.aabb;

                if (a_aabb.minX > b_aabb.maxX) {
                    // b is already closed. Remove from open and skip aabb test
                    open.splice(i, 1);
                } else if (axisAlignedBoundingBoxCollision(a_aabb, b_aabb)) {
                    potentials.push([a, b]);
                }
            }
            open.push(a);
        }
        return potentials;
    }

    add(collider: Collider) {
        this.colliders.push(collider);
    }

    remove(collider: Collider) {
        const i = this.colliders.indexOf(collider);
        if (i >= 0) {
            this.colliders.splice(i, 1);
        }
    }

}

function axisAlignedBoundingBoxCollision(a_aabb: AABB, b_aabb: AABB) {
    return a_aabb.maxX >= b_aabb.minX &&
        a_aabb.minX <= b_aabb.maxX &&
        a_aabb.maxY >= b_aabb.minY &&
        a_aabb.minY <= b_aabb.maxY;
}
