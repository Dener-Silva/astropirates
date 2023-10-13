import { useState } from "react"

export const About = () => {

    const [display, setDisplay] = useState("none");
    const [animation, setAnimation] = useState("");
    // Enable scroll after the animation finishes
    const [overflow, setOverflow] = useState("hidden");
    // align-items: center doesn't work with overflow: auto
    // We need to set it to baseline for scrolling to work properly
    const [alignItems, setAlignItems] = useState("center");

    function open() {
        setDisplay("flex");
        setAnimation("open 1000ms forwards");
        setOverflow("hidden");
        setAlignItems("center");
    }

    function close() {
        setAnimation("close 1000ms forwards");
        setOverflow("hidden");
        setAlignItems("center");
    }

    return (
        <>
            <button onClick={open}>About This Game</button>
            <div id="about-modal-backdrop" style={{ display }} onClick={close}>
                <div
                    id="about-modal"
                    style={{ animation, overflow, alignItems }}
                    onClick={(e) => e.stopPropagation()}
                    onAnimationEnd={(e) => {
                        if (e.animationName === "close") {
                            setDisplay("none");
                        }
                        setOverflow("auto");
                        setAlignItems("baseline");
                    }}>
                    <div id="about-modal-content">
                        <h1>About</h1>
                        <span>
                            This game is a demonstration piece for my <a href="https://dener-silva.github.io/portfolio/">portfolio</a>.
                            Many technologies were used to make this possible:
                        </span>
                        <div>
                            <h2>Front-end:</h2>
                            <ul>
                                <li>Graphics made using <a href="https://pixijs.com/">PixiJS</a></li>
                                <li>User interface made with <a href="https://react.dev/">React</a></li>
                            </ul>
                            <h2>Back-end:</h2>
                            <ul>
                                <li>Running on <a href="https://nodejs.org/">Node.js</a></li>
                                <li>Using <a href="https://mariadb.org/">MariaDB</a> for the global leaderboards (coming soon)</li>
                            </ul>
                            <h2>Other:</h2>
                            <ul>
                                <li>Client-server communication with WebSockets</li>
                                <li>Serialization done with <a href="https://avro.apache.org/">Avro</a></li>
                                <li>Automated deployment via <a href="https://github.com/features/actions">GitHub Actions</a></li>
                            </ul>
                        </div>
                        <button onClick={close}>Close</button>
                    </div>
                </div>
            </div>
        </>
    )
}