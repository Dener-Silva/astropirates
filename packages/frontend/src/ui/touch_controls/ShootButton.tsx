import _React, { useContext, useState } from "react";
import { GameState, GameStateContext } from "../GameStateContext";
import { inputSystemInstance } from "../../game/InputSystem";

export const ShootButton = () => {

    const [gameState] = useContext(GameStateContext);
    const [backgroundColor, setBackgroundColor] = useState('#ff000088');
    const display = gameState === GameState.InGame ? "" : "none";

    const startShooting = () => {
        setBackgroundColor('red');
        inputSystemInstance.onMouseDown();
    }

    const stopShooting = () => {
        setBackgroundColor('#ff000088');
        inputSystemInstance.onMouseUp();
    }

    return (
        <button id="shoot-button" style={{ display, backgroundColor }} onTouchStart={startShooting} onTouchEnd={stopShooting} >
            Shoot
        </button>
    )
}