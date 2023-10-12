import { InputSystem } from "../src/game/InputSystem.js";

global.window.innerWidth = 200;
global.window.innerHeight = 200;

test.each([
    [110, 100, 0, 0.1],
    [100, 90, -Math.PI / 2, 0.1],
])('Store and retrieve mouse movement at x=%i y=%i', (pageX, pageY, angle, magnitude) => {
    const inputSystem = new InputSystem();
    inputSystem.onPointerMove({ pageX, pageY } as PointerEvent);

    const input = inputSystem.getInput();

    expect(input.angle).toBe(angle);
    expect(input.magnitude).toBe(magnitude);
});

test.each([
    [0, 0, 3 * -Math.PI / 4],
    [200, 200, Math.PI / 4],
])('Limit magnitude to 1 at x=%i y=%i', (pageX, pageY, angle) => {
    const inputSystem = new InputSystem();
    inputSystem.onPointerMove({ pageX, pageY } as PointerEvent);

    const input = inputSystem.getInput();

    expect(input.angle).toBe(angle);
    expect(input.magnitude).toBe(1);
});

test('Should detect quick press', () => {
    const inputSystem = new InputSystem();
    inputSystem.onPointerMove({ pageX: 0, pageY: 1 } as PointerEvent);
    inputSystem.onMouseDown();
    inputSystem.onMouseUp();

    expect(inputSystem.getInput().shoot).toBeTruthy();
    expect(inputSystem.getInput().shoot).toBeFalsy();
});

test('Should keep shooting when holding the button down', () => {
    const inputSystem = new InputSystem();
    inputSystem.onPointerMove({ pageX: 0, pageY: 1 } as PointerEvent);
    inputSystem.onMouseDown();

    expect(inputSystem.getInput().shoot).toBeTruthy();
    expect(inputSystem.getInput().shoot).toBeTruthy();
});

test.each([
    (iS: InputSystem) => iS.onPointerMove({ pageX: 0, pageY: 1 } as PointerEvent),
    (iS: InputSystem) => iS.onMouseDown(),
    (iS: InputSystem) => iS.onMouseUp(),
])('Should detect that input changed', (func: (iS: InputSystem) => void) => {
    const inputSystem = new InputSystem();
    func(inputSystem);

    expect(inputSystem.inputChanged).toBeTruthy();
});

test.each([
    (iS: InputSystem) => iS.onPointerMove({ pageX: 0, pageY: 1 } as PointerEvent),
    (iS: InputSystem) => iS.onMouseUp(),
])("Should detect that input didn't change", (func: (iS: InputSystem) => void) => {
    const inputSystem = new InputSystem();
    func(inputSystem);

    inputSystem.getInput();

    expect(inputSystem.inputChanged).toBeFalsy();
});

test('Should detect that input changed twice on quick press', () => {
    const inputSystem = new InputSystem();
    inputSystem.onMouseDown();
    inputSystem.onMouseUp();

    expect(inputSystem.inputChanged).toBeTruthy();
    inputSystem.getInput();
    expect(inputSystem.inputChanged).toBeTruthy();
    inputSystem.getInput();
    expect(inputSystem.inputChanged).toBeFalsy();
});