import { Circle } from '../../src/collision/colliders/Circle.js';
import { Point } from '../../src/collision/colliders/Point.js';
import { Polygon } from '../../src/collision/colliders/Polygon.js';

describe('SAT', () => {

    describe('Circle vs Circle', () => {

        it('should collide', () => {
            let a = new Circle(1),
                b = new Circle(1);
            a.x = 2;

            expect(a.collidesWith(b)).toBeTruthy();
        });

        it('should not collide', () => {
            let a = new Circle(1),
                b = new Circle(1);
            a.x = 2.1;

            expect(a.collidesWith(b)).toBeFalsy();
        });

    });

    describe('Circle vs Point', () => {

        it('should collide', () => {
            let a = new Circle(1),
                b = new Point();
            a.x = 1;

            expect(a.collidesWith(b)).toBeTruthy();
            expect(b.collidesWith(a)).toBeTruthy();
        });

        it('should not collide', () => {
            let a = new Circle(1),
                b = new Point();
            a.x = 1.1;

            expect(a.collidesWith(b)).toBeFalsy();
            expect(b.collidesWith(a)).toBeFalsy();
        });

    });

    describe('Circle vs Polygon', () => {

        it('should collide', () => {
            let a = new Circle(1),
                b = new Polygon([-1, 0, 0, 1, 1, 0, 0, -1]);

            // Up
            a.y = -2;
            expect(a.collidesWith(b)).toBeTruthy();
            expect(b.collidesWith(a)).toBeTruthy();

            // Down Right
            a.x = a.y = (Math.sqrt(2) / 2) + 0.5;
            expect(a.collidesWith(b)).toBeTruthy();
            expect(b.collidesWith(a)).toBeTruthy();
        });

        it('should not collide', () => {
            let a = new Circle(1),
                b = new Polygon([-1, 0, 0, 1, 1, 0, 0, -1]);

            // Up, will bail out on circle vs polygon
            a.y = -2.1;
            expect(a.collidesWith(b)).toBeFalsy();
            expect(b.collidesWith(a)).toBeFalsy();

            // Down Right, will bail out on polygon vs circle
            a.x = a.y = (Math.sqrt(2) / 2) + 0.51;
            expect(a.collidesWith(b)).toBeFalsy();
            expect(b.collidesWith(a)).toBeFalsy();
        });

    });

    describe('Point vs Point', () => {

        test('should collide', () => {
            let a = new Point(),
                b = new Point();

            expect(a.collidesWith(b)).toBeTruthy();
        });

        test('should not collide', () => {
            let a = new Point(),
                b = new Point();
            a.x = 0.1;

            expect(a.collidesWith(b)).toBeFalsy();
        });

    });

    describe('Point vs Polygon', () => {

        test('should collide', () => {
            let a = new Point(),
                b = new Polygon([-1, 0, 0, 1, 1, 0, 0, -1]);

            // Up
            a.y = -1;
            expect(a.collidesWith(b)).toBeTruthy();
            expect(b.collidesWith(a)).toBeTruthy();

            // Down Right
            a.x = a.y = 0.5;
            expect(a.collidesWith(b)).toBeTruthy();
            expect(b.collidesWith(a)).toBeTruthy();
        });

        test('should not collide', () => {
            let a = new Point(),
                b = new Polygon([-1, 0, 0, 1, 1, 0, 0, -1]);

            // Up, will bail out on circle vs polygon
            a.y = -2.1;
            expect(a.collidesWith(b)).toBeFalsy();
            expect(b.collidesWith(a)).toBeFalsy();

            // Down Right, will bail out on polygon vs circle
            a.x = a.y = (Math.sqrt(2) / 2) + 0.51;
            expect(a.collidesWith(b)).toBeFalsy();
            expect(b.collidesWith(a)).toBeFalsy();
        });

    });

    describe('Polygon vs Polygon', () => {

        test('should collide', () => {
            let a = new Polygon([-1, 0, 0, 1, 1, 0, 0, -1]),
                b = new Polygon([-1, 0, 0, 1, 1, 0, 0, -1]);

            a.x = a.y = - 1;
            expect(a.collidesWith(b)).toBeTruthy();
            expect(b.collidesWith(a)).toBeTruthy();
        });

        test('should not collide', () => {
            let a = new Polygon([-1, 0, 0, 1, 1, 0, 0, -1]),
                b = new Polygon([-1, 0, 0, 1, 1, 0, 0, -1]);

            a.x = a.y = - 1.1;
            expect(a.collidesWith(b)).toBeFalsy();
            expect(b.collidesWith(a)).toBeFalsy();
        });

        test('should not collide', () => {
            let a = new Polygon([1, 0, 2, 0]),
                b = new Polygon([-1, 1, -1, -1]);

            expect(a.collidesWith(b)).toBeFalsy();
            expect(b.collidesWith(a)).toBeFalsy();
        });

        test('triangles facing outward should not collide', () => {
            let a = new Polygon([0, 1, 0, -1, 1, 0]),
                b = new Polygon([0, 1, 0, -1, -1, 0]);

            a.x = 0.1;
            expect(a.collidesWith(b)).toBeFalsy();
            expect(b.collidesWith(a)).toBeFalsy();
        });

    });

});