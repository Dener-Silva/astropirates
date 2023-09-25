import { onMouseDown, onMouseUp, onPointerMove, takeAllFromInputQueue } from "../src/InputSystem.js";

global.window.innerWidth = 200;
global.window.innerHeight = 200;

test.each([
    [110, 100, 0, 0.1],
    [100, 90, Math.PI / 2, 0.1],
])('Store and retrieve mouse movement at x=%i y=%i', (pageX, pageY, angle, magnitude) => {
    onPointerMove({ pageX, pageY } as PointerEvent);

    const inputQueue = takeAllFromInputQueue();

    expect(inputQueue.length).toBe(1);
    expect(inputQueue[0].angle).toBe(angle);
    expect(inputQueue[0].magnitude).toBe(magnitude);
});

test.each([
    [0, 0, 3 * Math.PI / 4],
    [200, 200, -Math.PI / 4],
])('Limit magnitude to 1 at x=%i y=%i', (pageX, pageY, angle) => {
    onPointerMove({ pageX, pageY } as PointerEvent);

    const inputQueue = takeAllFromInputQueue();

    expect(inputQueue.length).toBe(1);
    expect(inputQueue[0].angle).toBe(angle);
    expect(inputQueue[0].magnitude).toBe(1);
});

test('Should take all inputs from queue', () => {
    onPointerMove({ pageX: 0, pageY: 1 } as PointerEvent);
    onMouseDown();
    onMouseUp();

    expect(takeAllFromInputQueue()).toHaveLength(3);
    expect(takeAllFromInputQueue()).toHaveLength(0);
});