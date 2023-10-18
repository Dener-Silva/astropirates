import { ServerTopic, Welcome } from "dtos";
import _React from "react";
import { usePlayersNicknames, useScores, useSubscribeToTopic } from "../WebSocketClient";

/**
 * In-game score at the corner of the screen.
 */
export const ScoreDisplay = () => {

    const welcome = useSubscribeToTopic<Welcome>(ServerTopic.Welcome);
    const scores = useScores();
    const nicknames = usePlayersNicknames();

    if (!welcome) {
        return null;
    }

    const myId = welcome.id;

    let lastScore = -1;
    let lastPosition = 0;
    const rows = Object.entries(scores)
        .sort((a, b) => b[1].score - a[1].score)
        .map(([id, { score }]) => ({
            id: id,
            isMe: id === myId,
            position: score === lastScore ? lastPosition : ++lastPosition,
            nickname: nicknames[id]?.nickname,
            score: lastScore = score
        }));
    const myRow = rows.find(r => r.isMe);
    const isMobile = window.matchMedia("((max-width: 576px) or (max-height: 600px))").matches;
    const top = rows.slice(0, isMobile ? 3 : 6);
    if (myRow && !top.includes(myRow)) {
        top[top.length - 1] = myRow;
    }

    return (
        <div id="score-display">
            <span>Scoreboard</span>
            <table>
                <tbody>
                    {top.map((r) => (
                        <tr key={r.id} style={r.isMe ? { fontWeight: 'bold' } : {}}>
                            <td>#{r.position} :</td>
                            <td>{r.nickname}</td>
                            <td>{r.score} points</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}
