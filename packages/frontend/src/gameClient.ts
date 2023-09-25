import { Application, Container, Graphics } from "pixi.js";
import { Layers } from "./RenderingLayers.js";
import { onMouseDown, onMouseUp, onPointerMove, takeAllFromInputQueue } from "./InputSystem.js";

const gameCanvas = document.getElementById("game-canvas") as HTMLCanvasElement;

const app = new Application({
    view: gameCanvas,
    resizeTo: gameCanvas,
    backgroundAlpha: 0
});

const resize = () => {
    // Scale the game to the window keeping aspect ratio
    const aspectRatio = 4 / 3;
    let limitedByHeight = (window.innerWidth / window.innerHeight) > aspectRatio;
    let scale: number;
    if (limitedByHeight) {
        gameCanvas.width = window.innerHeight * aspectRatio;
        gameCanvas.height = window.innerHeight;
        scale = window.innerHeight / 600;
    } else {
        gameCanvas.width = window.innerWidth;
        gameCanvas.height = window.innerWidth / aspectRatio;
        scale = window.innerWidth / 800;
    }
    app.stage.scale.x = app.stage.scale.y = scale;
    app.renderer.resize(gameCanvas.width, gameCanvas.height);
}

window.addEventListener("load", resize);
window.addEventListener("resize", resize);

// Subscribe to input events
document.addEventListener('pointermove', onPointerMove);
document.addEventListener('mousedown', onMouseDown);
document.addEventListener('mouseup', onMouseUp);

const layers: Layers = {
    default: new Container(),
    foreground: new Container(),
    ui: new Container()
}

app.stage.addChild(layers.default, layers.foreground, layers.ui);

app.ticker.add((_delta) => {
    let m = takeAllFromInputQueue();
});