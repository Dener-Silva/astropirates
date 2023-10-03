import { Polygon } from '../../src/collision/colliders/Polygon.js';
import { AABB } from "../../src/collision/colliders/Collider.js";
import { toBeDeepCloseTo } from 'jest-matcher-deep-close-to';
expect.extend({ toBeDeepCloseTo });

describe('Polygon', () => {

    describe('Axis Aligned Bounding Box', () => {

        test('should get the correct aabb', () => {
            let polygon = new Polygon([-1, -1, -1, 1, 1, 1, 1, -1]);

            // The AABB is the smallest box that can contain the object in any rotation
            let expected: AABB = {
                minX: -Math.SQRT2,
                maxX: Math.SQRT2,
                minY: -Math.SQRT2,
                maxY: Math.SQRT2
            }
            expect(polygon.aabb).toEqual(expected);
        });

    });

    describe('Validate points', () => {

        test('Should only accept array of points with even length', () => {
            for (let i = 0; i < 100; i++) {
                const points = new Array<number>(i).fill(0);
                if (i % 2) {
                    expect(() => new Polygon(points)).toThrow();
                } else {
                    expect(() => new Polygon(points)).not.toThrow();
                }
            }
        });

    });

    describe('Rotation', () => {

        test('Should rotate 90 degrees', () => {
            let polygon = new Polygon([-1, -1, -1, 1, 1, 1, 1, -1]);

            polygon.rotation = Math.PI / 2;

            let expected = [1, -1, -1, -1, -1, 1, 1, 1];
            expect(polygon.points).toBeDeepCloseTo(expected);
        });

        test('Should rotate 45 degrees', () => {
            let polygon = new Polygon([-1, -1, -1, 1, 1, 1, 1, -1]);

            polygon.rotation = Math.PI / 4;

            let expected = [0, -Math.SQRT2, -Math.SQRT2, 0, 0, Math.SQRT2, Math.SQRT2, 0];
            expect(polygon.points).toBeDeepCloseTo(expected);
        });

        test('Should rotate 90 degrees on the correct pivot', () => {
            let polygon = new Polygon([-1, -1, -1, 1, 1, 1, 1, -1]);
            polygon.x = polygon.y = 1;

            polygon.rotation = Math.PI / 2;

            let expected = [2, 0, 0, 0, 0, 2, 2, 2];
            expect(polygon.points).toBeDeepCloseTo(expected);
        });

        test('Should update the points when rotating', () => {
            let polygon = new Polygon([-1, -1, -1, 1, 1, 1, 1, -1]);

            polygon.points
            polygon.rotation = Math.PI / 2;

            let expected = [1, -1, -1, -1, -1, 1, 1, 1];
            expect(polygon.points).toBeDeepCloseTo(expected);
        });

    });

    describe('Translation', () => {

        test('Should move points to the correct x and y', () => {
            let polygon = new Polygon([-1, -1, -1, 1, 1, 1, 1, -1]);
            for (let i = 0; i < 100; i++) {
                polygon.x = i;
                polygon.y = i;
                let expected = [-1, -1, -1, 1, 1, 1, 1, -1].map(p => p + i);
                expect(polygon.points).toBeDeepCloseTo(expected);
            }
        });

    });

});