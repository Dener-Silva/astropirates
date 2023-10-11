import { Application } from "pixi.js";
import { Renderer } from "../src/game/Renderer.js";
import { GameObjectState, ServerTopic } from "dtos";

test('Should add player in foreground layer', () => {
    const app = new Application();
    const renderer = new Renderer(app);

    renderer.addPlayer('0', { nickname: "Technocat" });

    expect(renderer.playerGraphics['0']).not.toBeUndefined();
    expect(renderer.playerGraphics['0'].parent).toBe(renderer.layers.foreground);
});

test('Should add current player in player layer', () => {
    const app = new Application();
    const renderer = new Renderer(app);

    renderer.myId = '0';
    renderer.addPlayer('0', { nickname: "Technocat" });

    expect(renderer.playerGraphics['0']).not.toBeUndefined();
    expect(renderer.playerGraphics['0'].parent).toBe(renderer.layers.player);
});

test.each([
    GameObjectState.Offline,
    GameObjectState.Exploded
])('Should remove player if their state is %i', (state) => {
    const app = new Application();
    const renderer = new Renderer(app);

    renderer.addPlayer('0', { nickname: "Dead " });
    renderer.addPlayer('1', { nickname: "Technocat" });
    const playerGraphics = renderer.playerGraphics['0'];
    renderer.serverUpdate({
        topic: ServerTopic.GameUpdate,
        players: { 0: { x: 0, y: 0, rotation: 0, state, score: 0 } },
        bullets: {}
    });

    expect(renderer.playerGraphics['0']).toBeUndefined();
    expect(playerGraphics.parent).toBeNull();
});

test('Should create bullet graphics', () => {
    const app = new Application();
    const renderer = new Renderer(app);

    // Update will create the bullet graphics
    renderer.serverUpdate({
        topic: ServerTopic.GameUpdate,
        players: {},
        bullets: { 0: { x: 0, y: 0, state: GameObjectState.Active } }
    });
    const bulletGraphics = renderer.bulletGraphics['0'];

    expect(bulletGraphics).not.toBeUndefined();
    expect(bulletGraphics.parent).toBe(renderer.layers.foreground);
});

test.each([
    GameObjectState.Expired,
    GameObjectState.Exploded
])('Should remove bullet if their state is %i', (state) => {
    const app = new Application();
    const renderer = new Renderer(app);

    renderer.serverUpdate({
        topic: ServerTopic.GameUpdate,
        players: {},
        bullets: { 0: { x: 0, y: 0, state: GameObjectState.Active } }
    });
    const bulletGraphics = renderer.bulletGraphics['0'];
    renderer.serverUpdate({
        topic: ServerTopic.GameUpdate,
        players: {},
        bullets: { 0: { x: 0, y: 0, state } }
    });

    expect(renderer.bulletGraphics['0']).toBeUndefined();
    expect(bulletGraphics.parent).toBeNull();
});