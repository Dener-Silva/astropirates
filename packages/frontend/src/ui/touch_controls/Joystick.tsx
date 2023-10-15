import _React, { ClassAttributes, useContext, useEffect, useRef, useState } from "react";
import { GameState, GameStateContext } from "../GameStateContext";
import nipplejs from "nipplejs";
import { inputSystemInstance } from "../../game/InputSystem";



export const Joystick = () => {

    const [gameState] = useContext(GameStateContext);
    const ref = useRef<HTMLDivElement>(null);
    const display = gameState === GameState.InGame ? "" : "none";

    useEffect(() => {
        if (gameState !== GameState.InGame) {
            return;
        }
        const options = {
            zone: ref.current!,
        }
        const manager = nipplejs.create(options);
        manager.on('move', function (_evt, data) {
            inputSystemInstance.onJoystickMove(-data.angle.radian, data.force);
        });
        return () => {
            manager.destroy();
        }
    }, [gameState])

    return (
        <div id="zone_joystick" ref={ref} style={{ display }} />
    )
}