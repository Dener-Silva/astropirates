import { useEffect, useState } from "react"
import { LeaderboardContent } from "./LeaderboardContent";
import { useSubscribeToTopic } from "../../WebSocketClient";
import { Rank, ServerTopic } from "dtos";

export const Leaderboard = () => {

    const [display, setDisplay] = useState("none");
    const [animation, setAnimation] = useState("");
    const [animationFinished, setAnimationFinished] = useState(false);

    const rank = useSubscribeToTopic<Rank>(ServerTopic.Rank);

    const close = () => {
        setAnimation("close 1000ms forwards");
        setAnimationFinished(false);
    };
    const open = () => {
        setAnimation("open 1000ms forwards");
        setDisplay("");
    };

    useEffect(() => { rank && open() }, [rank]);

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
                        } else {
                            setAnimationFinished(true)
                        }
                    }}>
                    <LeaderboardContent animationFinished={animationFinished} close={close} />
                </div>
            </div>
        </>
    )
}