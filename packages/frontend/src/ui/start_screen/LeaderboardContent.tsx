import _React, { useEffect, useRef, useState } from "react";
import { useLeaderboard } from "../../WebSocketClient";
import { LeaderboardRow } from "dtos";

export const LeaderboardTable = ({ close }: { close: () => void }) => {

    // Row height is fixed to make infinite scrolling easier
    const rowHeight = 30;
    const scrollableDiv = useRef<HTMLDivElement>(null);
    const [divHeight, setDivHeight] = useState<number>(scrollableDiv.current?.offsetHeight || 20);
    const [rowNumber, setRowNumber] = useState<number>(0);
    const leaderboard = useLeaderboard();
    const visibleRows = Math.ceil(divHeight / rowHeight);

    useEffect(() => {
        const div = scrollableDiv.current;
        if (!div) {
            return;
        }
        new ResizeObserver(() => setDivHeight(div.offsetHeight || 20)).observe(div);
    }, []);

    const onScroll = () => {
        if (!scrollableDiv.current) {
            return;
        }
        setRowNumber(Math.min(Math.floor(scrollableDiv.current.scrollTop / rowHeight), leaderboard.count - visibleRows));
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
                <table style={{
                    marginTop,
                    marginBottom
                }}>
                    <tbody>
                        {rows.map((r, i) => {
                            if (r) {
                                return (<tr className="leaderboard-roll" key={i}>
                                    <td>#{String(r.rank)}</td>
                                    <td>{r.name}</td>
                                    <td>{String(r.score)}</td>
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
