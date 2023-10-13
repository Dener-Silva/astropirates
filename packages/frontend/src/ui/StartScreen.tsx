import { useIsInGame } from "../WebSocketClient";
import { About } from "./About"
import { NameForm } from "./NameForm";

export const StartScreen = () => {
    const isInGame = useIsInGame();

    return (
        <div id="start-screen" style={isInGame ? { display: 'none' } : {}}>
            <h1 id="title">AstroPirates</h1>
            <NameForm></NameForm>
            <About></About>
        </div>
    )
}