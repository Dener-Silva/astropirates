import _React, { useEffect, useRef, useState } from "react";
import { useLeaderboard, useSubscribeToTopic } from "../../WebSocketClient";
import { LeaderboardRow, Rank, ServerTopic } from "dtos";

export const LeaderboardContent = ({ close, animationFinished }: { close: () => void, animationFinished: boolean }) => {

    // Row height is fixed to make infinite scrolling easier
    const rowHeight = 30;
    const scrollableDiv = useRef<HTMLDivElement>(null);
    const [divHeight, setDivHeight] = useState<number>(scrollableDiv.current?.offsetHeight || 0);
    const [rowNumber, setRowNumber] = useState<number>(0);
    // TODO fix LeaderboardContent updating while not visible.
    // Then we can increase the page size of the Leaderboard queries.
    const leaderboard = useLeaderboard();
    const visibleRows = Math.min(Math.ceil(divHeight / rowHeight) + 1, leaderboard.count);

    const myRank = useSubscribeToTopic<Rank>(ServerTopic.Rank);

    useEffect(() => {
        const div = scrollableDiv.current;
        if (!div) {
            return;
        }
        new ResizeObserver(() => setDivHeight(div.clientHeight)).observe(div);
    }, []);

    useEffect(() => {
        const div = scrollableDiv.current;
        if (!animationFinished || !div || !myRank) {
            return;
        }
        const top = (Number(myRank.rowNumber) - visibleRows / 2) * rowHeight;
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
                                const className = myRank?.rowId === r.id ? " leaderboard-my-row" : "";
                                return (<tr className={"leaderboard-row" + className} key={i}>
                                    <td>#{String(r.rank)}</td>
                                    <td>{r.name}</td>
                                    <td>{String(r.score)} points</td>
                                </tr>)
                            } else {
                                return <tr className="leaderboard-row" key={i}><td>#-</td><td>-</td><td>-</td></tr>
                            }
                        })}
                    </tbody>
                </table>
            </div>
            <button onClick={close}>Close</button>
        </div>
    )
}
