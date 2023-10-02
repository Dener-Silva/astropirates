export type AABB = { minX: number; maxX: number; minY: number; maxY: number; };

export interface ObjectWithCollider {
    collider: Collider
    onCollision(other?: ObjectWithCollider): void
}

export interface Collider {
    enabled: boolean;
    x: number;
    y: number;
    rotation: number;
    aabb: AABB;
    owner?: ObjectWithCollider
    collidesWith(collider: Collider): boolean
}
