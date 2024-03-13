import { ClientTopic, LeaderboardRow, getLeaderboardType, Leaderboard as LeaderboardDTO, ServerTopic } from "dtos";
import { addTopicListener, sendMessage } from "../WebSocketClient";

export class Leaderboard {

    private readonly pageSize = 20;
    private cache: LeaderboardRow[] = [];
    private validPages = new Set<number>();
    private pendingPages = new Set<number>();
    count = 0;
    version = 0;

    constructor() {
        // Delay to avoid "Uncaught ReferenceError"
        setTimeout(() => {
            const leaderboardCallback = (leaderboard: LeaderboardDTO) => {
                leaderboard.rows.forEach((r, i) => {
                    this.cache[i + leaderboard.offset] = r
                })
                this.count = Number(leaderboard.count);
                const page = Math.floor(leaderboard.offset / this.pageSize);
                this.validPages.add(page);
                this.pendingPages.delete(page);
                this.version++;
            }
            addTopicListener(ServerTopic.Leaderboard, leaderboardCallback);
            const invalidateCache = () => {
                this.validPages.clear();
            }
            addTopicListener(ServerTopic.InvalidateLeaderboardCache, invalidateCache);
            // Fetch first page to initialize "count" variable
            this.loadPage(0);
        })
    }

    private loadPage(page: number) {
        const firstPageRow = page * this.pageSize;
        const cacheHit = this.validPages.has(page);
        const pending = this.pendingPages.has(page);
        if (!cacheHit && !pending) {
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
        return this.cache[rowNumber] || null;
    }

}

export const leaderboardInstance = new Leaderboard();