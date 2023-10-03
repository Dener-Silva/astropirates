import { SweepAndPrune } from "../../src/collision/SweepAndPrune.js";
import { Circle } from "../../src/collision/colliders/Circle.js";
import { Collider } from "../../src/collision/colliders/Collider.js";
import { Point } from "../../src/collision/colliders/Point.js";

describe('Sweep And Prune test', () => {

    describe('Potentials point x point', () => {

        test('should get the potential collisions', () => {
            let pointA = new Point();
            let pointB = new Point();
            pointA.x = pointA.y = pointB.x = pointB.y = 0;
            expectPotentialCollisions(pointA, pointB)
        });

        test('should get no potential collisions', () => {
            let pointA = new Point();
            let pointB = new Point();
            pointA.x = pointA.y = 0.1;
            pointB.x = pointB.y = 10;
            expectNoPotentialCollisions(pointA, pointB);
        });
    });

    describe('Potentials aabb', () => {

        test.each([
            [0, 0],
            [-.9, -.9],
            [.9, -.9],
            [.9, .9],
            [-.9, .9],
        ])('should get the potential collisions: %i, %i', (x, y) => {
            let a = new Circle(0.49);
            let b = new Circle(0.49);
            a.x = x;
            a.y = y;
            expectPotentialCollisions(a, b)
        });

        test.each([
            [-1, -1],
            [1, -1],
            [1, 1],
            [-1, 1],
            [-1, 0],
            [1, 0],
            [0, -1],
            [0, 1],
        ])('should get no potential collisions: %i, %i', (x, y) => {
            let a = new Circle(0.49);
            let b = new Circle(0.49);
            a.x = x;
            a.y = y;
            expectNoPotentialCollisions(a, b);
        });
    });

    describe('Many objects', () => {

        test('should get no false positives', () => {
            let sap = new SweepAndPrune();
            let colliders: Collider[] = []
            for (let i = 0; i < 20; i++) {
                for (let j = 0; j < 20; j++) {
                    let circle = new Circle(0.49);
                    circle.x = i;
                    circle.y = j;
                    colliders.push(circle);
                }
            }

            colliders.forEach((c) => sap.add(c));
            let potentials = sap.update();

            expect(potentials).toHaveLength(0);
        });

        test('should get all collisions when C is closed before B', () => {
            let sap = new SweepAndPrune();
            let a = new Circle(1),
                b = new Circle(2),
                c = new Circle(1);
            a.x = 0;
            b.x = 2;
            c.x = 4;

            sap.add(a);
            sap.add(b);
            sap.add(c);
            let potentials = sap.update();

            expectUnordered(potentials, [[a, b], [b, c]]);
        });

        test('pairs should be all combinations of the colliding objects', () => {
            let sap = new SweepAndPrune();
            let a = new Circle(3),
                b = new Circle(3),
                c = new Circle(3);
            a.x = 0;
            b.x = 1;
            c.x = 2;

            sap.add(a);
            sap.add(b);
            sap.add(c);
            let potentials = sap.update();

            expectUnordered(potentials, [[a, b], [a, c], [b, c]]);
        });
    });

    describe('Persistence', () => {

        test('should clear the pairs from last frame', () => {
            let a = new Circle(5);
            let b = new Circle(5);
            let sap = new SweepAndPrune();

            sap.add(a);
            sap.add(b);
            sap.update();
            let potentials = sap.update();

            expectUnordered(potentials, [[a, b]]);
        });
    });

    describe('Remove colliders', () => {

        test('should not affect the other colliders', () => {
            let sap = new SweepAndPrune();
            let a = new Circle(3),
                b = new Circle(3),
                c = new Circle(3);
            a.x = 0;
            b.x = 1;
            c.x = 2;

            sap.add(a);
            sap.add(b);
            sap.add(c);
            sap.remove(b);
            let potentials = sap.update();

            expectUnordered(potentials, [[a, c]]);
        });
    });

});

function expectNoPotentialCollisions(a: Collider, b: Collider) {
    let sap = new SweepAndPrune();

    sap.add(a);
    sap.add(b);
    const potentials = sap.update();

    expect(potentials).toHaveLength(0);
}

function expectPotentialCollisions(a: Collider, b: Collider) {
    let sap = new SweepAndPrune();

    sap.add(a);
    sap.add(b);
    let potentials = sap.update();

    expectUnordered(potentials, [[a, b]]);
}

function expectUnordered(actual: [Collider, Collider][], expected: [Collider, Collider][]) {
    let compareColliders = (a: Collider, b: Collider) => a.x - b.x || a.y - b.y;
    for (let pair of actual) {
        pair.sort(compareColliders);
    }
    for (let pair of expected) {
        pair.sort(compareColliders);
    }
    actual.sort((a, b) => compareColliders(a[0], b[0]) || compareColliders(a[1], b[1]));
    expected.sort((a, b) => compareColliders(a[0], b[0]) || compareColliders(a[1], b[1]));

    expect(actual).toEqual(expected);
}