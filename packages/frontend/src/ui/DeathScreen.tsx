import _React, { useContext, useRef, useState } from "react";
import { usePlayersNicknames, useSubscribeToTopic } from "../WebSocketClient";
import { Destroyed, ServerTopic } from "dtos";
import { GameState, GameStateContext } from "./GameStateContext";

export const DeathScreen = () => {

    const [gameState, setGameState] = useContext(GameStateContext);
    const lastKnownNickname = useRef("");
    const nicknames = usePlayersNicknames();
    const destroyed = useSubscribeToTopic<Destroyed>(ServerTopic.Destroyed);
    const display = gameState === GameState.Destroyed ? "" : "none";
    const [continueClicked, setContinueClicked] = useState(false);

    // Enemy might log out, whick can cause problems.
    // In that case, we save the nickname
    let enemyNickname = lastKnownNickname.current;
    if (destroyed?.byWhom && nicknames[destroyed.byWhom]) {
        enemyNickname = nicknames[destroyed.byWhom].nickname;
        lastKnownNickname.current = enemyNickname;
    }
    const animation = continueClicked ? "close 1000ms forwards" : "open 1000ms forwards";

    return (
        <div className="popup-backdrop" style={{ display }}>
            <div
                className="open-animation-container"
                style={{ animation }}>
                <div className="popup-content">
                    <span>You were destroyed by<br />{enemyNickname}</span>
                </div>
            </div>
            <div
                className="open-animation-container"
                style={{ animation, width: "max-content" }}
                onAnimationEnd={(e) => {
                    if (e.animationName === "close") {
                        setContinueClicked(false);
                        setGameState(GameState.StartScreen);
                    }
                }}>
                <button style={{ border: 'none' }} onClick={() => setContinueClicked(true)}>Continue</button>
            </div>
        </div>
    )
}