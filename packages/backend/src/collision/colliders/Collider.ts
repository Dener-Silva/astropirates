export type AABB = { minX: number; maxX: number; minY: number; maxY: number; };

export interface Collider {
    enabled: boolean;
    x: number;
    y: number;
    rotation: number;
    aabb: AABB;
    collidesWith(collider: Collider): boolean
}
