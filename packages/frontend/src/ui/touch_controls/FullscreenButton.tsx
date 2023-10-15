import _React, { useState } from "react";
import enterFullscreen from "./enter-fullscreen.svg"
import exitFullscreen from "./exit-fullscreen.svg"

export const FullscreenButton = () => {

    const [icon, setIcon] = useState(document.fullscreenElement ? exitFullscreen : enterFullscreen);

    const onClick = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
            setIcon(exitFullscreen);
        } else if (document.exitFullscreen) {
            document.exitFullscreen();
            setIcon(enterFullscreen);
        }
    }

    return (
        <div id="fullscreen-button" onClick={onClick} >
            <img src={icon} />
        </div>
    )
}