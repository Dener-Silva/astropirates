import _React, { Dispatch, PropsWithChildren, SetStateAction, createContext, useEffect, useRef, useState } from 'react'
import { addTopicListener, removeTopicListener } from '../WebSocketClient';
import { GameObjectState, GameUpdate, ServerTopic, Welcome } from 'dtos';

export enum GameState {
    StartScreen,
    InGame,
    Destroyed
}

type GameStateContextValue = [gameState: GameState, setGameState: Dispatch<SetStateAction<GameState>>];
export const GameStateContext = createContext<GameStateContextValue>(null as any);

export const GameStateProvider = (props: PropsWithChildren) => {

    // useRef is needed to persist the id
    const myIdRef = useRef<string>("");
    // useState is needed to re-render
    const [gameState, setGameState] = useState(GameState.StartScreen);

    const welcomeCallback = (welcome: Welcome) => {
        myIdRef.current = welcome.id;
    }
    const gameUpdateCallback = (gameUpdate: GameUpdate) => {
        const me = gameUpdate.players[myIdRef.current];
        if (!me) {
            return;
        }
        if (me.state < GameObjectState.ToBeRemoved) {
            setGameState(GameState.InGame);
        } else {
            setGameState(GameState.Destroyed);
        }
    }
    useEffect(() => {
        addTopicListener(ServerTopic.Welcome, welcomeCallback);
        addTopicListener(ServerTopic.GameUpdate, gameUpdateCallback);
        return () => {
            removeTopicListener(ServerTopic.Welcome, welcomeCallback);
            removeTopicListener(ServerTopic.GameUpdate, gameUpdateCallback);
        }
    }, []);

    return (
        <GameStateContext.Provider value={[gameState, setGameState]}>
            {props.children}
        </GameStateContext.Provider>
    )
}