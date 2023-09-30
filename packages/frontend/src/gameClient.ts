import { Application, Container } from "pixi.js";
import { Layers } from "./RenderingLayers.js";
import { getInput, onMouseDown, onMouseUp, onPointerMove } from "./InputSystem.js";
import { ClientTopic, GameUpdate, ServerTopic, SetNickname, gameUpdateType, inputType, setNicknameResponseType, setNicknameType, tickrateType, topicType } from "dtos";
import { Buffer } from "buffer";

console.debug('Connecting to', import.meta.env.VITE_WEBSOCKET_URL)
const ws = new WebSocket(import.meta.env.VITE_WEBSOCKET_URL);
ws.binaryType = 'arraybuffer';
ws.addEventListener("error", console.error);
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

let serverDelta: number | undefined = undefined;
let myId: number | undefined = undefined;
let gameUpdate: GameUpdate | undefined = undefined;

ws.addEventListener("message", ({ data }) => {
    const buffer = Buffer.from(data);
    const topic: ServerTopic = topicType.fromBuffer(buffer, undefined, true);
    switch (topic) {
        case (ServerTopic.Tickrate):
            const message = tickrateType.fromBuffer(buffer);
            serverDelta = 1000 / message.tickrate;
            break;
        case (ServerTopic.SetNicknameResponse):
            const nicknameResponse = setNicknameResponseType.fromBuffer(buffer);
            if (nicknameResponse.success) {
                myId = nicknameResponse.id;
            }
            break;
        case (ServerTopic.GameUpdate):
            gameUpdate = gameUpdateType.fromBuffer(buffer);
            if (myId) {
                ws.send(inputType.toBuffer(getInput()));
            }
            break;
    }
});

// "Choose Your Name" Form
const nameForm = document.getElementById("name-form") as HTMLFormElement;
nameForm.onsubmit = (e) => {
    e.preventDefault();
    const clientMessage: SetNickname = {
        topic: ClientTopic.SetNickname,
        nickname: nameForm.nickname.value
    };
    ws.send(setNicknameType.toBuffer(clientMessage));
}

setInterval(() => console.log(gameUpdate), 2000);

// app.ticker.add((_delta) => {
//     TODO interpolate
// });