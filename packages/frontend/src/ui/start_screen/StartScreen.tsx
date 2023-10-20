import { useContext } from "react";
import { About } from "./About"
import { NameForm } from "./NameForm";
import { GameState, GameStateContext } from "../GameStateContext";
import { Leaderboard } from "./Leaderboard";

export const StartScreen = () => {
    const [gameState] = useContext(GameStateContext);

    return (
        <div id="start-screen" style={gameState === GameState.StartScreen ? {} : { display: 'none' }}>
            <h1 id="title">AstroPirates</h1>
            <NameForm></NameForm>
            <About></About>
            <Leaderboard />
        </div>
    )
}