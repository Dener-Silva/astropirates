import { ClientTopic } from "dtos";
import { WebSocketServer, WebSocket } from "ws";
import { ClientMessage } from "dtos";
import { addPlayer, registerInputs } from "./gameServer.js";

export function runWebSocketServer(wss: WebSocketServer) {

    const activeSockets = new Map<number, WebSocket>();
    let currentId = 0;

    wss.on('connection', (ws) => {
        const id = currentId++;
        activeSockets.set(id, ws);

        ws.on('error', console.error);

        ws.on('message', (data: Buffer) => {
            try {
                const dataView = new DataView(data.buffer, data.byteOffset, data.byteLength);
                const message = ClientMessage.deserialize(dataView);

                switch (message.topic) {
                    case ClientTopic.SetName:
                        addPlayer(id, message.nickname!);
                        break;
                    case ClientTopic.Input:
                        registerInputs(id, message.inputs!);
                        break;
                }
            } catch (e) {
                console.error(e);
            }
        });

        ws.on('close', () => activeSockets.delete(id));
    });

    setInterval(() => {
        for (const ws of activeSockets.values()) {
            ws.send(performance.now());
        }
    }, 50)
}