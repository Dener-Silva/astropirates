import { Application } from "pixi.js";
import { getInput, onMouseDown, onMouseUp, onPointerMove } from "./InputSystem.js";
import { Renderer } from "./Renderer.js";
import { addTopicListener, sendMessage } from "../WebSocketClient.js";
import { GameUpdate, NewPlayer, ServerTopic, Welcome, inputType } from "dtos";

// Initialize rendering (Pixi.JS)
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
    app.stage.x = app.renderer.width / 2;
    app.stage.y = app.renderer.height / 2;
    app.renderer.resize(gameCanvas.width, gameCanvas.height);
}
window.addEventListener("load", resize);
window.addEventListener("resize", resize);

const renderer = new Renderer(app);
app.ticker.add((_delta) => {
    renderer.update();
});

// Subscribe to input events
document.addEventListener('pointermove', onPointerMove);
document.addEventListener('mousedown', onMouseDown);
document.addEventListener('mouseup', onMouseUp);
document.addEventListener('keydown', (e) => e.key === ' ' && onMouseDown());
document.addEventListener('keyup', (e) => e.key === ' ' && onMouseUp());

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
    if (myId && gameUpdate.players[myId]) {
        sendMessage(inputType, getInput());
    }
});