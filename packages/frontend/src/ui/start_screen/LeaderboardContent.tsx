import _React, { useEffect, useRef, useState } from "react";
import { useLeaderboard, useSubscribeToTopic } from "../../WebSocketClient";
import { Destroyed, LeaderboardRow, ServerTopic } from "dtos";

export const LeaderboardContent = ({ close, animationFinished }: { close: () => void, animationFinished: boolean }) => {

    // Row height is fixed to make infinite scrolling easier
    const rowHeight = 30;
    const scrollableDiv = useRef<HTMLDivElement>(null);
    const [divHeight, setDivHeight] = useState<number>(scrollableDiv.current?.offsetHeight || 20);
    const [rowNumber, setRowNumber] = useState<number>(0);
    const leaderboard = useLeaderboard();
    const visibleRows = Math.ceil(divHeight / rowHeight);

    const destroyed = useSubscribeToTopic<Destroyed>(ServerTopic.Destroyed);

    useEffect(() => {
        const div = scrollableDiv.current;
        if (!div) {
            return;
        }
        new ResizeObserver(() => setDivHeight(div.offsetHeight || 20)).observe(div);
    }, []);

    useEffect(() => {
        const div = scrollableDiv.current;
        if (!animationFinished || !div || !destroyed) {
            return;
        }
        const top = (Number(destroyed.rowNumber) - visibleRows / 2) * rowHeight;
        div.scroll({ top, behavior: "smooth" });
    }, [animationFinished]);

    const onScroll = () => {
        if (!scrollableDiv.current) {
            return;
        }
        const row = Math.floor(scrollableDiv.current.scrollTop / rowHeight);
        setRowNumber(Math.max(Math.min(row, leaderboard.count - visibleRows), 0));
    }

    const rows: (LeaderboardRow | null)[] = [];
    for (let i = rowNumber; i < rowNumber + visibleRows; i++) {
        rows.push(leaderboard.getRow(i))
    }

    const marginTop = rowNumber * rowHeight;
    const marginBottom = (leaderboard.count - (rowNumber + visibleRows)) * rowHeight;

    return (
        <div id="leaderboard-content">
            <h1>Leaderboard</h1>
            <div id="leaderboard-scroll" onScroll={onScroll} ref={scrollableDiv}>
                <table id="leaderboard-table" style={{
                    marginTop,
                    marginBottom
                }}>
                    <tbody>
                        {rows.map((r, i) => {
                            if (r) {
                                const className = destroyed?.rowId === r.id ? " leaderboard-my-row" : "";
                                return (<tr className={"leaderboard-row" + className} key={i}>
                                    <td>#{String(r.rank)}</td>
                                    <td>{r.name}</td>
                                    <td>{String(r.score)} points</td>
                                </tr>)
                            } else {
                                return <tr key={i}><td>#-</td><td>-</td><td>-</td></tr>
                            }
                        })}
                    </tbody>
                </table>
            </div>
            <button onClick={close}>Close</button>
        </div>
    )
}
