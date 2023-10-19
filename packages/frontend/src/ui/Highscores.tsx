import _React, { useEffect, useRef, useState } from "react";

export const Highscores = () => {

    const rowHeightReference = useRef<HTMLTableRowElement>(null);
    const [rowHeight, setRowHeight] = useState<number>(0);
    const scrollableDiv = useRef<HTMLDivElement>(null);
    const [rowNumber, setRowNumber] = useState<number>(0);

    useEffect(() => {
        const row = rowHeightReference.current;
        row && setRowHeight(row.offsetHeight);
    }, [rowHeightReference.current]);

    const onScroll = () => {
        if (!scrollableDiv.current?.offsetHeight) {
            return;
        }
        setRowNumber(Math.min(Math.floor(scrollableDiv.current.scrollTop / rowHeight), 991));
    }

    const marginTop = rowNumber * rowHeight;
    const marginBottom = 991 * rowHeight - marginTop;

    return (
        <div className="open-animation-container" style={{
            display: 'flex',
            flexDirection: 'column',
            padding: '20px',
            gap: '20px'
        }}>
            <span>Highscores</span>

            <div style={{
                display: 'flex',
                flexDirection: 'column',
                flexWrap: 'nowrap',
                maxHeight: '200px',
                overflow: 'auto'
            }} onScroll={onScroll} ref={scrollableDiv}>

                <table style={{
                    marginTop,
                    marginBottom,
                    width: '200px'
                }}>
                    <tbody>
                        <tr ref={rowHeightReference}>
                            <td>{rowNumber + 1}</td>
                        </tr>
                        <tr>
                            <td>{rowNumber + 2}</td>
                        </tr>
                        <tr>
                            <td>{rowNumber + 3}</td>
                        </tr>
                        <tr>
                            <td>{rowNumber + 4}</td>
                        </tr>
                        <tr>
                            <td>{rowNumber + 5}</td>
                        </tr>
                        <tr>
                            <td>{rowNumber + 6}</td>
                        </tr>
                        <tr>
                            <td>{rowNumber + 7}</td>
                        </tr>
                        <tr>
                            <td>{rowNumber + 8}</td>
                        </tr>
                        <tr>
                            <td>{rowNumber + 9}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    )
}
