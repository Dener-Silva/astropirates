import { Application } from "pixi.js";
import { Renderer } from "../src/rendering/Renderer.js";

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

    renderer.setMyId('0');
    renderer.addPlayer('0', { nickname: "Technocat" });

    expect(renderer.playerGraphics['0']).not.toBeUndefined();
    expect(renderer.playerGraphics['0'].parent).toBe(renderer.layers.player);
});

test('Should move current player to player layer if myId is set too late', () => {
    const app = new Application();
    const renderer = new Renderer(app);

    renderer.addPlayer('0', { nickname: "Technocat" });
    renderer.setMyId('0');

    expect(renderer.playerGraphics['0']).not.toBeUndefined();
    expect(renderer.playerGraphics['0'].parent).toBe(renderer.layers.player);
});

test('Should remove player', () => {
    const app = new Application();
    const renderer = new Renderer(app);

    renderer.addPlayer('0', { nickname: "Technocat" });
    const playerGraphics = renderer.playerGraphics['0'];
    renderer.removePlayer('0');

    expect(renderer.playerGraphics['0']).toBeUndefined();
    expect(renderer.previousPlayers['0']).toBeUndefined();
    expect(renderer.players['0']).toBeUndefined();
    expect(playerGraphics.parent).toBeNull();
});