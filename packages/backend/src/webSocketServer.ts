import { ClientTopic, NeverError, inputType, setNicknameType, setNicknameResponseType, SetNicknameResponse, ServerTopic, topicType, gameUpdateType } from "dtos";
import { WebSocketServer } from "ws";
import { GameServer } from "./GameServer.js";
import { delta } from './delta.js';

export function runWebSocketServer(wss: WebSocketServer) {

    const gameServer = new GameServer();
    let currentId = 0;

    wss.on('connection', (ws) => {
        const id = currentId++;

        ws.on('error', console.error);

        ws.on('message', (data: Buffer) => {
            try {
                const topic: ClientTopic = topicType.fromBuffer(data, undefined, true);
                switch (topic) {
                    case ClientTopic.SetNickname:
                        const message = setNicknameType.fromBuffer(data);
                        const success = gameServer.addPlayer(id, message.nickname);
                        const response: SetNicknameResponse = {
                            topic: ServerTopic.SetNicknameResponse,
                            id,
                            nickname: message.nickname,
                            success
                        }
                        ws.send(setNicknameResponseType.toBuffer(response))
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
        const state = gameServer.update();
        for (const ws of wss.clients) {
            ws.send(gameUpdateType.toBuffer(state));
        }
    }, delta)
}