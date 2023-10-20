import { ClientTopic, LeaderboardRow, getLeaderboardType, Leaderboard as LeaderboardDTO, ServerTopic } from "dtos";
import { addTopicListener, sendMessage } from "../WebSocketClient";

export class Leaderboard {

    private pageSize = 20;
    private cache: LeaderboardRow[] = [];
    private pendingPages = new Set<number>;
    private _count: number | null = null;

    constructor() {
        const leaderboardCallback = (leaderboard: LeaderboardDTO) => {
            leaderboard.rows.forEach((r, i) => {
                this.cache[i + leaderboard.offset] = r
            })
            this._count = Number(leaderboard.count);
            const page = Math.floor(leaderboard.offset / this.pageSize);
            this.pendingPages.delete(page);
        }
        addTopicListener(ServerTopic.Leaderboard, leaderboardCallback);
    }

    private loadPage(page: number) {
        const firstPageRow = page * this.pageSize;
        const cacheHit = this.cache[firstPageRow];
        const pending = this.pendingPages.has(page);
        const inBounds = this._count === null || firstPageRow < this._count;
        if (!cacheHit && !pending && inBounds) {
            this.pendingPages.add(page);
            sendMessage(getLeaderboardType, {
                topic: ClientTopic.GetLeaderboard,
                offset: firstPageRow,
                limit: this.pageSize
            } as const);
        }
    }

    getRow(rowNumber: number): LeaderboardRow | null {
        const page = Math.floor(rowNumber / this.pageSize);
        this.loadPage(page);
        this.loadPage(page + 1);
        return this.cache[rowNumber] || null;
    }

    get count() {
        return this._count || 0;
    }
}