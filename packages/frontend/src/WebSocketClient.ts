import { Type } from "avro-js";
import { NeverError, NewPlayer, ServerTopic, gameUpdateType, newPlayerType, topicType, welcomeType } from "dtos";
import _react, { Dispatch, SetStateAction, useEffect, useState } from "react";
import { Buffer } from "buffer";

// Connect to server
console.debug('Connecting to', import.meta.env.VITE_WEBSOCKET_URL)
const ws = new WebSocket(import.meta.env.VITE_WEBSOCKET_URL);
ws.binaryType = 'arraybuffer';
ws.addEventListener("error", console.error);

let myId: string | undefined = undefined;

const listeners: { [topic: number]: ((message: any) => any)[] } = {};
for (let key in ServerTopic) {
    if (!isNaN(Number(key))) {
        listeners[key] = [];
    }
}

/**
 * Listen to server messages on the web socket connection.
 * @param topic Topic of the messages to listen to
 * @param callback Function to be called upon receiving a message from the server. This function does not infer the TypeScript type of the message.
 */
export function addTopicListener<T = any>(topic: ServerTopic, callback: (message: T) => any) {
    listeners[topic].push(callback);
}

/**
 * Remove callback from the listeners of the server messages on the web socket connection.
 * @param topic Topic of the messages the callback was listening to
 * @param callback Listener to be removed from the list
 */
export function removeTopicListener<T = any>(topic: ServerTopic, callback: (message: T) => any) {
    const topicListeners = listeners[topic];
    const i = topicListeners.indexOf(callback);
    if (i >= 0) {
        topicListeners.splice(i, 1);
    }
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
            listeners[topic].forEach((c) => c(topic));
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
        const callback = (newPlayer: NewPlayer) => {
            if (newPlayer?.id && newPlayer.id === myId && !isInGame) {
                setIsInGame(true);
            }
        }
        addTopicListener(ServerTopic.NewPlayer, callback);
        return () => {
            removeTopicListener(ServerTopic.NewPlayer, callback);
        }
    }, []);

    return isInGame;
}

/**
 * Special hook for showing the "Nickname is already taken" warning.
 */
export function useNicknameAlreadyExists(): [boolean, Dispatch<SetStateAction<boolean>>] {

    const [alreadyExists, setAlreadyExists] = useState(false);

    const callback = () => setAlreadyExists(true);
    useEffect(() => {
        addTopicListener(ServerTopic.NicknameAlreadyExists, callback);
        return () => {
            removeTopicListener(ServerTopic.NicknameAlreadyExists, callback);
        }
    }, []);

    return [alreadyExists, setAlreadyExists];
}

/**
 * Hook for listening to events sent from the server via web socket.
 * @returns Latest message sent on the topic
 */
export function useSubscribeToTopic<T>(topic: ServerTopic) {

    const [message, setMessage] = useState<T | null>(null)

    useEffect(() => {
        addTopicListener(topic, setMessage);
        return () => {
            removeTopicListener(topic, setMessage);
        }
    }, []);

    return message;
}