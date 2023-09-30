import { Application } from "pixi.js";
import { getInput, onMouseDown, onMouseUp, onPointerMove } from "./InputSystem.js";
import { ClientTopic, ServerTopic, SetNickname, gameUpdateType, inputType, setNicknameResponseType, setNicknameType, tickrateType, topicType } from "dtos";
import { Buffer } from "buffer";
import { Renderer } from "./rendering/Renderer.js";
import { setServerDelta } from "./delta.js";

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
    app.stage.x = app.renderer.width / 2;
    app.stage.y = app.renderer.height / 2;
    app.renderer.resize(gameCanvas.width, gameCanvas.height);
}

window.addEventListener("load", resize);
window.addEventListener("resize", resize);

// Subscribe to input events
document.addEventListener('pointermove', onPointerMove);
document.addEventListener('mousedown', onMouseDown);
document.addEventListener('mouseup', onMouseUp);

const renderer = new Renderer(app)
let myId: number | undefined = undefined;

ws.addEventListener("message", ({ data }) => {
    const buffer = Buffer.from(data);
    const topic: ServerTopic = topicType.fromBuffer(buffer, undefined, true);
    switch (topic) {
        case (ServerTopic.Tickrate):
            const message = tickrateType.fromBuffer(buffer);
            setServerDelta(1000 / message.tickrate);
            break;
        case (ServerTopic.SetNicknameResponse):
            const nicknameResponse = setNicknameResponseType.fromBuffer(buffer);
            if (nicknameResponse.success) {
                myId = nicknameResponse.id;
                renderer.myId = myId;
            }
            break;
        case (ServerTopic.GameUpdate):
            renderer.serverUpdate(gameUpdateType.fromBuffer(buffer));
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
    nameForm.parentElement!.style.visibility = 'hidden';
}

app.ticker.add((_delta) => {
    renderer.update();
});