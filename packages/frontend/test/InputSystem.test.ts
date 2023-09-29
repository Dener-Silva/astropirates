import { onMouseDown, onMouseUp, onPointerMove, getInput } from "../src/InputSystem.js";

global.window.innerWidth = 200;
global.window.innerHeight = 200;

test.each([
    [110, 100, 0, 0.1],
    [100, 90, Math.PI / 2, 0.1],
])('Store and retrieve mouse movement at x=%i y=%i', (pageX, pageY, angle, magnitude) => {
    onPointerMove({ pageX, pageY } as PointerEvent);

    const input = getInput();

    expect(input.angle).toBe(angle);
    expect(input.magnitude).toBe(magnitude);
});

test.each([
    [0, 0, 3 * Math.PI / 4],
    [200, 200, -Math.PI / 4],
])('Limit magnitude to 1 at x=%i y=%i', (pageX, pageY, angle) => {
    onPointerMove({ pageX, pageY } as PointerEvent);

    const input = getInput();

    expect(input.angle).toBe(angle);
    expect(input.magnitude).toBe(1);
});

test('Should detect quick press', () => {
    onPointerMove({ pageX: 0, pageY: 1 } as PointerEvent);
    onMouseDown();
    onMouseUp();

    expect(getInput().shoot).toBeTruthy();
    expect(getInput().shoot).toBeFalsy();
});