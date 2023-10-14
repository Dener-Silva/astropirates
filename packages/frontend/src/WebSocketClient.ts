import { Type } from "avro-js";
import { GameObjectState, GameUpdate, NeverError, NewPlayer, ServerTopic, gameUpdateType, newPlayerType, destroyedType, topicType, welcomeType, Dictionary, PlayerAttributes, Welcome } from "dtos";
import _react, { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";
import { Buffer } from "buffer";

// Connect to server
console.debug('Connecting to', import.meta.env.VITE_WEBSOCKET_URL)
const ws = new WebSocket(import.meta.env.VITE_WEBSOCKET_URL);
ws.binaryType = 'arraybuffer';
ws.addEventListener("error", console.error);

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
        case (ServerTopic.Destroyed):
            const destroyed = destroyedType.fromBuffer(buffer);
            listeners[topic].forEach((c) => c(destroyed));
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
 * Special hook for listing player names
 */
export function usePlayersNicknames() {

    // useRef is needed to persist the nicknames and avoid re-rendering every tick
    const nicknamesRef = useRef<Dictionary<PlayerAttributes>>({});
    // useState is needed to re-render when a player logs in or logs out
    const [nicknames, setNicknames] = useState(nicknamesRef.current);

    const welcomeCallback = (welcome: Welcome) => {
        Object.assign(nicknamesRef.current, welcome.players);
        setNicknames(nicknamesRef.current);
    }
    const newPlayerCallback = (newPlayer: NewPlayer) => {
        nicknamesRef.current[newPlayer.id] = newPlayer.player;
        setNicknames(nicknamesRef.current);
    }
    const gameUpdateCallback = (gameUpdate: GameUpdate) => {
        const toBeRemoved = Object.entries(gameUpdate.players)
            .filter(([_, player]) => player.state >= GameObjectState.ToBeRemoved)
            .map(([id]) => id);
        if (toBeRemoved.length) {
            toBeRemoved.forEach((id) => delete nicknamesRef.current[id]);
            setNicknames(nicknamesRef.current);
        }
    }
    useEffect(() => {
        addTopicListener(ServerTopic.Welcome, welcomeCallback);
        addTopicListener(ServerTopic.NewPlayer, newPlayerCallback);
        addTopicListener(ServerTopic.GameUpdate, gameUpdateCallback);
        return () => {
            removeTopicListener(ServerTopic.Welcome, welcomeCallback);
            removeTopicListener(ServerTopic.NewPlayer, newPlayerCallback);
            removeTopicListener(ServerTopic.GameUpdate, gameUpdateCallback);
        }
    }, []);

    return nicknames;
}

/**
 * Special hook for listening to changes on the scoreboard 
 */
export function useScores() {

    // useRef is needed to persist the scores and avoid re-rendering every tick
    const scoresRef = useRef<Dictionary<{ score: number }>>({});
    // useState is needed to re-render when scores actually change
    const [scores, setScores] = useState(scoresRef.current);

    const callback = (gameUpdate: GameUpdate) => {
        // Update if there are any changes in scores
        if (Object.keys(gameUpdate.players).length !== Object.keys(scoresRef.current).length) {
            scoresRef.current = gameUpdate.players;
            setScores(gameUpdate.players);
            return;
        }
        for (const [id, player] of Object.entries(gameUpdate.players)) {
            if (scoresRef.current[id]?.score !== player.score) {
                scoresRef.current = gameUpdate.players;
                setScores(gameUpdate.players);
                return;
            }
        }
    }
    useEffect(() => {
        addTopicListener(ServerTopic.GameUpdate, callback);
        return () => {
            removeTopicListener(ServerTopic.GameUpdate, callback);
        }
    }, []);

    return scores;
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