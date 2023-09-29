import { ClientTopic } from "dtos";
import { WebSocketServer } from "ws";
import { ClientMessage } from "dtos";
import { createGameServer } from "./GameServer.js";

export function runWebSocketServer(wss: WebSocketServer) {

    const gameServer = createGameServer();
    let currentId = 0;

    wss.on('connection', (ws) => {
        const id = currentId++;

        ws.on('error', console.error);

        ws.on('message', (data: Buffer) => {
            try {
                const dataView = new DataView(data.buffer, data.byteOffset, data.byteLength);
                const message = ClientMessage.deserialize(dataView);

                switch (message.topic) {
                    case ClientTopic.SetName:
                        gameServer.addPlayer(id, message.nickname!);
                        break;
                    case ClientTopic.Input:
                        gameServer.registerInputs(id, message.inputs!);
                        break;
                }
            } catch (e) {
                console.error(e);
            }
        });

        ws.on('close', () => {
            gameServer.removePlayer(id)
        });
    });

    setInterval(() => {
        for (const ws of wss.clients) {
            ws.send(performance.now());
        }
    }, 50)
}