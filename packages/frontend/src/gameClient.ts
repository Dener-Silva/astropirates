import { Application } from "pixi.js";
import { getInput, onMouseDown, onMouseUp, onPointerMove } from "./InputSystem.js";
import { ClientTopic, ServerTopic, SetNickname, gameUpdateType, inputType, newPlayerType, setNicknameType, welcomeType, topicType, NeverError } from "dtos";
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
document.addEventListener('keydown', (e) => e.key === ' ' && onMouseDown());
document.addEventListener('keyup', (e) => e.key === ' ' && onMouseUp());


const renderer = new Renderer(app)
let myId: string | undefined = undefined;

ws.addEventListener("message", ({ data }) => {
    const buffer = Buffer.from(data);
    const topic: ServerTopic = topicType.fromBuffer(buffer, undefined, true);
    switch (topic) {
        case (ServerTopic.Welcome):
            const welcomeMessage = welcomeType.fromBuffer(buffer);
            myId = welcomeMessage.id;
            renderer.myId = myId;
            setServerDelta(1000 / welcomeMessage.tickrate);
            Object.entries(welcomeMessage.players).forEach(([id, player]) => {
                renderer.addPlayer(id, player)
            });
            break;
        case (ServerTopic.NewPlayer): {
            const message = newPlayerType.fromBuffer(buffer);
            renderer.addPlayer(message.id, message.player);
            if (message.id === myId) {
                nameForm.parentElement!.style.display = 'none';
            }
            break;
        }
        case (ServerTopic.NicknameAlreadyExists):
            console.warn(ServerTopic[topic]);
            // TODO show error on screen
            break;
        case (ServerTopic.GameUpdate):
            const gameUpdate = gameUpdateType.fromBuffer(buffer);
            renderer.serverUpdate(gameUpdate);
            if (myId && gameUpdate.players[myId]) {
                ws.send(inputType.toBuffer(getInput()));
            }
            break;
        default:
            throw new NeverError(topic);
    }
});

// "Choose Your Name" Form
const nameForm = document.getElementById("name-form") as HTMLFormElement;
nameForm.onsubmit = (e) => {
    e.preventDefault();
    if (nameForm.nickname.value?.trim().length < 1) {
        return;
    }
    const clientMessage: SetNickname = {
        topic: ClientTopic.SetNickname,
        nickname: nameForm.nickname.value
    };
    ws.send(setNicknameType.toBuffer(clientMessage));
}
const updateButton = () => {
    nameForm.go.disabled = nameForm.nickname.value?.trim().length < 1;
}
nameForm.nickname.onchange = nameForm.nickname.onkeyup = updateButton;

app.ticker.add((_delta) => {
    renderer.update();
});