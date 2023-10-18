import { Application } from "pixi.js";
import { Renderer } from "./Renderer.js";
import { addTopicListener } from "../WebSocketClient.js";
import { AdminTopic, GameUpdate, NewPlayer, ServerTopic, SetAiParameters, Welcome, setAiParametersType, topicType } from "dtos";
import { Buffer } from 'buffer';

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
    app.stage.x = window.innerWidth / 2;
    app.stage.y = window.innerHeight / 2;
    app.renderer.resize(window.innerWidth, window.innerHeight);
}
window.addEventListener("load", resize);
window.addEventListener("resize", resize);

const renderer = new Renderer(app);
app.ticker.add((_delta) => {
    renderer.update();
});

// Zoom
function limitPosition(postiton: number, range: number, scale: number) {
    const max = Math.max(1600 - (range / (2 * scale)), 0);
    return Math.min(Math.max(-max, postiton), max);
}
app.stage.scale.x = app.stage.scale.y = window.innerHeight / 3200;
addEventListener('wheel', (e: WheelEvent) => {
    let scale = app.stage.scale.x;
    scale += e.deltaY * -0.0005;
    scale = Math.min(Math.max(window.innerHeight / 3200, scale), 1);
    app.stage.scale.x = app.stage.scale.y = scale;

    let x = app.stage.pivot.x;
    let y = app.stage.pivot.y;
    x = limitPosition(x, window.innerWidth, scale);
    y = limitPosition(y, window.innerHeight, scale);
    app.stage.pivot.x = x;
    app.stage.pivot.y = y;
})

// Drag
let isDragging = false;
let startX = 0, startY = 0;
addEventListener('mousedown', (e) => {
    const scale = app.stage.scale.x;
    startX = app.stage.pivot.x + e.clientX / scale;
    startY = app.stage.pivot.y + e.clientY / scale;
    isDragging = true;
});
addEventListener('mousemove', (e) => {
    if (isDragging) {
        const scale = app.stage.scale.x;
        let x = startX - e.clientX / scale;
        let y = startY - e.clientY / scale;
        x = limitPosition(x, window.innerWidth, scale);
        y = limitPosition(y, window.innerHeight, scale);
        app.stage.pivot.x = x;
        app.stage.pivot.y = y;
    }
});
addEventListener('mouseup', () => isDragging = false);


// Subscribe to WebSocket messages
addTopicListener(ServerTopic.Welcome, (welcome: Welcome) => {
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
});

// Connect to server
console.debug('Connecting to', import.meta.env.VITE_WEBSOCKET_URL)
const ws = new WebSocket(import.meta.env.VITE_WEBSOCKET_URL, 'admin');
ws.binaryType = 'arraybuffer';
ws.addEventListener("error", console.error);

ws.addEventListener("message", ({ data }) => {
    const buffer = Buffer.from(data);
    const parameters = setAiParametersType.fromBuffer(buffer);
    for (const [key, value] of Object.entries(parameters)) {
        if (key === 'topic') continue;
        const slider = document.getElementById(key) as HTMLInputElement;
        slider.valueAsNumber = value;
        const text = document.getElementById(key + 'Text') as HTMLTableCellElement;
        text.innerText = String(value);
    }
});

for (let input of document.getElementsByTagName("input")!) {
    input.addEventListener('change', () => {
        const message: { [key: string]: number } = {
            topic: AdminTopic.SetAiParameters
        };
        for (let input of document.getElementsByTagName("input")!) {
            message[input.id] = input.valueAsNumber;
        }
        ws.send(setAiParametersType.toBuffer(message as SetAiParameters))
    })
}

const reset = document.getElementById("reset") as HTMLButtonElement;
reset.onclick = () => ws.send(topicType.toBuffer(AdminTopic.ResetAiParameters));
const killBots = document.getElementById("kill-bots") as HTMLButtonElement;
killBots.onclick = () => ws.send(topicType.toBuffer(AdminTopic.KillBots));