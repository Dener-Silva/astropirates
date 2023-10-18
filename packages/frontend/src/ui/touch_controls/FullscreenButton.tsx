import _React, { useEffect, useState } from "react";
import enterFullscreen from "./enter-fullscreen.svg"
import exitFullscreen from "./exit-fullscreen.svg"

export const FullscreenButton = () => {

    const [icon, setIcon] = useState(document.fullscreenElement ? exitFullscreen : enterFullscreen);

    useEffect(() => {
        const callback = () => {
            setIcon(document.fullscreenElement ? exitFullscreen : enterFullscreen);
        }
        addEventListener('fullscreenchange', callback);
        return () => removeEventListener('fullscreenchange', callback);
    }, [])

    const onClick = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
        } else if (document.exitFullscreen) {
            document.exitFullscreen();
        }
    }

    return (
        <div id="fullscreen-button" onClick={onClick} >
            <img src={icon} />
        </div>
    )
}