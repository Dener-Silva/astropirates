import { useState } from "react"
import { LeaderboardTable } from "./LeaderboardContent";

export const Leaderboard = () => {

    const [display, setDisplay] = useState("none");
    const [animation, setAnimation] = useState("");

    const close = () => setAnimation("close 1000ms forwards");
    const open = () => {
        setAnimation("open 1000ms forwards");
        setDisplay("");
    };

    return (
        <>
            <button onClick={open}>Leaderboard</button>
            <div id="about-modal-backdrop" style={{ display }} onClick={close}>
                <div
                    className="open-animation-container"
                    style={{ animation }}
                    onClick={(e) => e.stopPropagation()}
                    onAnimationEnd={(e) => {
                        if (e.animationName === "close") {
                            setDisplay("none")
                        }
                    }}>
                    <LeaderboardTable close={close} />
                </div>
            </div>
        </>
    )
}