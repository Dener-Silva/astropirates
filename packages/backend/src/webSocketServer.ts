import { ClientTopic, NeverError, inputType, setNameType, setNameResponseType, SetNameResponse, ServerTopic, topicType } from "dtos";
import { WebSocketServer } from "ws";
import { createGameServer } from "./GameServer.js";

export function runWebSocketServer(wss: WebSocketServer) {

    const gameServer = createGameServer();
    let currentId = 0;

    wss.on('connection', (ws) => {
        const id = currentId++;

        ws.on('error', console.error);

        ws.on('message', (data: Buffer) => {
            try {
                const topic: ClientTopic = topicType.fromBuffer(data, undefined, true);
                switch (topic) {
                    case ClientTopic.SetName:
                        const message = setNameType.fromBuffer(data);
                        const success = gameServer.addPlayer(id, message.nickname);
                        const response: SetNameResponse = {
                            topic: ServerTopic.SetNameResponse,
                            id,
                            nickname: message.nickname,
                            success
                        }
                        console.log(setNameResponseType.toBuffer(response))
                        ws.send(setNameResponseType.toBuffer(response))
                        break;
                    case ClientTopic.Input:
                        gameServer.registerInputs(id, inputType.fromBuffer(data));
                        break;
                    default:
                        throw new NeverError(topic, `Unknown message topic: ${topic}`);
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
            // TODO
        }
    }, 50)
}