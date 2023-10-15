import { Application } from "pixi.js";
import { inputSystemInstance } from "./InputSystem.js";
import { Renderer } from "./Renderer.js";
import { addTopicListener, sendMessage } from "../WebSocketClient.js";
import { GameUpdate, NewPlayer, ServerTopic, Welcome, inputType } from "dtos";
import { isMultiTouch } from "../isMultiTouch.js";

// Initialize rendering (Pixi.JS)
const gameCanvas = document.getElementById("game-canvas") as HTMLCanvasElement;

const app = new Application({
    view: gameCanvas,
    backgroundAlpha: 0,
    antialias: true,
    resolution: devicePixelRatio,
    autoDensity: true
});

const resize = () => {
    // Scale the game to the window keeping aspect ratio
    const horizontal = window.innerWidth > window.innerHeight;
    const baseWidth = horizontal ? 800 : 600;
    const baseHeight = horizontal ? 600 : 800;
    const aspectRatio = baseWidth / baseHeight;
    let limitedByHeight = (window.innerWidth / window.innerHeight) > aspectRatio;
    let scale, width, height;
    if (limitedByHeight) {
        scale = window.innerHeight / baseHeight;
        width = window.innerHeight * aspectRatio;
        height = window.innerHeight;
    } else {
        scale = window.innerWidth / baseWidth;
        width = window.innerWidth;
        height = window.innerWidth / aspectRatio;
    }
    app.stage.scale.x = app.stage.scale.y = scale;
    app.stage.x = width / 2;
    app.stage.y = height / 2;
    app.renderer.resize(width, height);
}
window.addEventListener("load", resize);
window.addEventListener("resize", resize);

const renderer = new Renderer(app);
app.ticker.add((_delta) => {
    renderer.update();
});

// Subscribe to input events
const inputSystem = inputSystemInstance;

// Inputs if on mouse + keyboard
if (!isMultiTouch()) {
    document.addEventListener('pointermove', (e) => inputSystem.onPointerMove(e));
    document.addEventListener('mousedown', () => inputSystem.onMouseDown());
    document.addEventListener('mouseup', () => inputSystem.onMouseUp());
}
document.addEventListener('keydown', (e) => e.key === ' ' && inputSystem.onMouseDown());
document.addEventListener('keyup', (e) => e.key === ' ' && inputSystem.onMouseUp());

// Subscribe to WebSocket messages
let myId: string | undefined;
addTopicListener(ServerTopic.Welcome, (welcome: Welcome) => {
    renderer.myId = myId = welcome.id;
    renderer.serverDelta = 1000 / welcome.tickrate;
    Object.entries(welcome.players).forEach(([id, player]) => {
        renderer.addPlayer(id, player);
    });
});

addTopicListener(ServerTopic.NewPlayer, (newPlayer: NewPlayer) => {
    renderer.addPlayer(newPlayer.id, newPlayer.player);
});

addTopicListener(ServerTopic.GameUpdate, (gameUpdate: GameUpdate) => {
    renderer.serverUpdate(gameUpdate);
    if (myId && gameUpdate.players[myId] && inputSystem.inputChanged) {
        sendMessage(inputType, inputSystem.getInput());
    }
});