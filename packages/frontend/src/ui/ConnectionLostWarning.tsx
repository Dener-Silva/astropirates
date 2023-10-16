import _React, { useEffect, useState } from "react";
import { useIsDisconnected } from "../WebSocketClient";

export const ConnectionLostWarning = () => {

    const isDisconnected = useIsDisconnected();
    const [display, setDisplay] = useState<"" | "none">("none");
    const animation = isDisconnected ? "open 1000ms forwards" : "close 1000ms forwards";

    useEffect(() => {
        isDisconnected && setDisplay("");
    }, [isDisconnected]);

    return (
        <div className="connection-lost-backdrop popup-backdrop" style={{ display }}>
            <div
                className="warning open-animation-container"
                style={{ animation }}>
                <div className="popup-content">
                    <span>Connection lost</span>
                </div>
            </div>
            <div
                className="open-animation-container"
                style={{ animation, width: "max-content" }}
                onAnimationEnd={(e) => {
                    if (e.animationName === "close") {
                        setDisplay("none");
                    }
                }}>
                <button style={{ border: 'none' }} onClick={() => location.reload()}>Refresh</button>
            </div>
        </div>
    )
}