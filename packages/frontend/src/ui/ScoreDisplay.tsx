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
    const top6 = rows.slice(0, 6);
    if (myRow && !top6.includes(myRow)) {
        top6[5] = myRow;
    }

    return (
        <div id="score-display">
            <span>Scoreboard</span>
            <table>
                <tbody>
                    {top6.map((r) => (
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
