import { Type } from "avro-js";
import { NeverError, NewPlayer, ServerTopic, Welcome, gameUpdateType, newPlayerType, topicType, welcomeType } from "dtos";
import _react, { useEffect, useState } from "react";
import { Buffer } from "buffer";

// Connect to server
console.debug('Connecting to', import.meta.env.VITE_WEBSOCKET_URL)
const ws = new WebSocket(import.meta.env.VITE_WEBSOCKET_URL);
ws.binaryType = 'arraybuffer';
ws.addEventListener("error", console.error);

let myId: string | undefined = undefined;

const listeners: { [topic: number]: ((message: any) => any)[] } = {};
for (let key in Object.keys(ServerTopic)) {
    if (!isNaN(Number(key))) {
        listeners[key] = [];
    }
}

export function addTopicListener<T = any>(topic: ServerTopic, callback: (message: T) => any) {
    listeners[topic].push(callback);
}

ws.addEventListener("message", ({ data }) => {
    const buffer = Buffer.from(data);
    const topic: ServerTopic = topicType.fromBuffer(buffer, undefined, true);
    switch (topic) {
        case (ServerTopic.Welcome):
            const welcomeMessage = welcomeType.fromBuffer(buffer);
            myId = welcomeMessage.id;
            listeners[topic].forEach((c) => c(welcomeMessage));
            break;
        case (ServerTopic.NewPlayer): {
            const newPlayerMessage = newPlayerType.fromBuffer(buffer);
            listeners[topic].forEach((c) => c(newPlayerMessage));
            break;
        }
        case (ServerTopic.NicknameAlreadyExists):
            console.warn(ServerTopic[topic]);
            // TODO show error on screen
            break;
        case (ServerTopic.GameUpdate):
            const gameUpdate = gameUpdateType.fromBuffer(buffer);
            listeners[topic].forEach((c) => c(gameUpdate));
            break;
        default:
            throw new NeverError(topic);
    }
});

/**
 * Send message through the web socket
 * @param type Avro type to encode the message
 * @param message 
 */
export function sendMessage<T>(type: Type<T>, message: T) {
    ws.send(type.toBuffer(message));
}

/**
 * Special hook for closing the "Choose Your Name" form.
 * @returns if the name was set successfuly, meaning the player is now in the game
 */
export function useIsInGame() {

    const [isInGame, setIsInGame] = useState(false);

    useEffect(() => {
        const topicListeners = listeners[ServerTopic.NewPlayer];
        const callback = (newPlayer: NewPlayer) => {
            if (newPlayer?.id && newPlayer.id === myId && !isInGame) {
                setIsInGame(true);
            }
        }
        topicListeners.push(callback);
        return () => {
            const i = topicListeners.indexOf(callback);
            if (i >= 0) {
                topicListeners.splice(i, 1);
            }
        }
    }, []);

    return isInGame;
}

/**
 * Hook for listening to events sent from the server via web socket.
 * @returns Latest message sent on the topic
 */
export function useSubscribeToTopic<T>(topic: ServerTopic) {

    const [message, setMessage] = useState<T | null>(null)

    useEffect(() => {
        const topicListeners = listeners[topic];
        topicListeners.push(setMessage);
        return () => {
            const i = topicListeners.indexOf(setMessage);
            if (i >= 0) {
                topicListeners.splice(i, 1);
            }
        }
    }, []);

    return message;
}