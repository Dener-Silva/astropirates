import { Type } from "avro-js";
import { GameUpdate, NeverError, ServerTopic, destroyedType, topicType, welcomeType, Dictionary, fullGameUpdateType, Score, partialGameUpdateType, gameUpdateType, leaderboardType, rankType } from "dtos";
import _react, { Dispatch, SetStateAction, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { Buffer } from "buffer";
// Avro needs the Buffer constructor in global space
window.Buffer = Buffer;
import fossilDelta from "fossil-delta";
import { leaderboardInstance } from "./db/Leaderboard";

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

let gameUpdateBuffer: Buffer | number[] | null = null;

ws.addEventListener("message", ({ data }) => {
    const buffer = Buffer.from(data);
    const topic: ServerTopic = topicType.fromBuffer(buffer, undefined, true);
    switch (topic) {
        case ServerTopic.Welcome:
            const welcomeMessage = welcomeType.fromBuffer(buffer);
            listeners[topic].forEach((c) => c(welcomeMessage));
            break;
        case ServerTopic.NicknameAlreadyExists:
            listeners[topic].forEach((c) => c(topic));
            break;
        case ServerTopic.GameUpdate:
            // Not a valid topic. Updates are either full or partial
            break;
        case ServerTopic.FullGameUpdate:
            const fullGameUpdate = fullGameUpdateType.fromBuffer(buffer);
            // Chop off the topic from the start of the buffer (topic is 1 byte)
            gameUpdateBuffer = buffer.subarray(1);
            listeners[ServerTopic.GameUpdate].forEach((c) => c(fullGameUpdate));
            listeners[ServerTopic.FullGameUpdate].forEach((c) => c(fullGameUpdate));
            break;
        case ServerTopic.PartialGameUpdate:
            if (!gameUpdateBuffer) {
                break;
            }
            const partialGameUpdate = partialGameUpdateType.fromBuffer(buffer);
            gameUpdateBuffer = fossilDelta.apply(gameUpdateBuffer, partialGameUpdate.delta);
            const gameUpdate = gameUpdateType.fromBuffer(Buffer.from(gameUpdateBuffer));
            listeners[ServerTopic.GameUpdate].forEach((c) => c(gameUpdate));
            listeners[ServerTopic.PartialGameUpdate].forEach((c) => c(gameUpdate));
            break;
        case ServerTopic.Destroyed:
            const destroyed = destroyedType.fromBuffer(buffer);
            listeners[topic].forEach((c) => c(destroyed));
            break;
        case ServerTopic.Leaderboard:
            const leaderboard = leaderboardType.fromBuffer(buffer);
            listeners[topic].forEach((c) => c(leaderboard));
            break;
        case ServerTopic.InvalidateLeaderboardCache:
            listeners[topic].forEach((c) => c(topic));
            break;
        case ServerTopic.Rank:
            const rank = rankType.fromBuffer(buffer);
            listeners[topic].forEach((c) => c(rank));
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
    if (ws.readyState === ws.OPEN) {
        ws.send(type.toBuffer(message));
    } else {
        ws.addEventListener('open', () => ws.send(type.toBuffer(message)));
    }
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
 * Special hook for listening to changes on the scoreboard 
 */
export function useScoreboard() {

    // useRef is needed to persist the scores and avoid re-rendering every tick
    const scoresRef = useRef<Dictionary<Score>>({});
    // useState is needed to re-render when scores actually change
    const [scores, setScores] = useState(scoresRef.current);

    const callback = (gameUpdate: GameUpdate) => {
        // Update if there are any changes in scores
        let changed = Object.keys(gameUpdate.scoreboard).length !== Object.keys(scoresRef.current).length;
        for (const [id, score] of Object.entries(gameUpdate.scoreboard)) {
            const current = scoresRef.current[id];
            if (!current || current.score !== score.score || current.nickname !== score.nickname) {
                changed = true;
                break;
            }
        }
        if (changed) {
            scoresRef.current = gameUpdate.scoreboard;
            setScores(gameUpdate.scoreboard);
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

/**
 * Hook for warning that the user is disconnected from the server.
 * @returns Wether the user is disconnected.
 */
export function useIsDisconnected() {
    const lastUpdate = useRef(performance.now());
    const [isDisconnected, setIsDisconnected] = useState(false);

    const gameUpdateCallback = () => {
        lastUpdate.current = performance.now();
    }
    const checkConnection = () => {
        setIsDisconnected(performance.now() - lastUpdate.current > 2000);
    }
    useEffect(() => {
        addTopicListener(ServerTopic.GameUpdate, gameUpdateCallback);
        const id = setInterval(checkConnection, 2000);
        return () => {
            removeTopicListener(ServerTopic.GameUpdate, gameUpdateCallback);
            clearInterval(id);
        }
    }, []);

    return isDisconnected;
}

/**
 * Hook for querying the leaderboard, caching the results.
 * @returns Leaderbord rows.
 */
export function useLeaderboard() {
    function subscribe(onStoreChange: () => void) {
        addTopicListener(ServerTopic.Leaderboard, onStoreChange);
        addTopicListener(ServerTopic.InvalidateLeaderboardCache, onStoreChange);
        return () => {
            removeTopicListener(ServerTopic.Leaderboard, onStoreChange);
            removeTopicListener(ServerTopic.InvalidateLeaderboardCache, onStoreChange);
        }
    }
    useSyncExternalStore(subscribe, () => leaderboardInstance.version);

    return leaderboardInstance;
}