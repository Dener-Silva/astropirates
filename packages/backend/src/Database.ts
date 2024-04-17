import { GetLeaderboard, LeaderboardRow, Score } from 'dtos';
import mariadb, { Pool } from 'mariadb'

type DbLeaderboardRow = { id: bigint, name: string, score: bigint, ts: Date, rank_: bigint }
type RowNumberQueryResult = [{ id: bigint, row_number_: bigint }]

function decodeBase94(encodedString: string): number {
    const base94Chars = "!\"#$%&'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~";

    let decodedNumber = 0;
    const encodedStringLength = encodedString.length;

    for (let i = 0; i < encodedStringLength; i++) {
        const char = encodedString.charAt(i);
        const charValue = base94Chars.indexOf(char);

        if (charValue === -1) {
            throw new Error(`Invalid character "${char}" in the encoded string.`);
        }

        decodedNumber = decodedNumber * 94 + charValue;
    }

    return decodedNumber;
}

export class Database {

    pool: Pool
    idPrefix: bigint

    constructor() {
        this.pool = mariadb.createPool({
            host: process.env.DB_HOST,
            port: Number(process.env.DB_PORT),
            database: process.env.DB_DATABASE,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD
        });

        // IDs are prefixed by the boot time, with 31-bit precision. This makes sure we don't
        // have duplicate IDs across reboots
        this.idPrefix = (BigInt(Date.now()) << 22n) & 0x7FFFFFFF00000000n
    }

    async getLeaderboard(params: GetLeaderboard): Promise<[LeaderboardRow[], bigint]> {
        let conn;
        try {
            conn = await this.pool.getConnection();
            const query = "select *, rank() over (order by score desc) as rank_ from highscores order by rank_, ts limit ? offset ?";
            const rows: DbLeaderboardRow[] = await conn.query(query, [params.limit, params.offset]);
            const countQuery = "select count(1) as c from highscores";
            const [{ c }]: [{ c: bigint }] = await conn.query(countQuery);

            return [rows.map(r => ({
                rank: r.rank_,
                ...r
            })), c];
        } finally {
            if (conn) conn.release();
        }
    }

    generateId(gameId: string): bigint {
        // The database ID is 63 bits
        // First 31 bits are the server boot timestamp, and the last 32 bits are the player's
        // ID in the game, which is a Base94 encoded integer.
        return this.idPrefix | BigInt(decodeBase94(gameId))
    }

    async getSessionHighScore(gameId: string): Promise<bigint> {
        let conn;
        try {
            conn = await this.pool.getConnection();
            const select = "select score from highscores where id = ? limit 1";
            const rows: DbLeaderboardRow[] = await conn.query(select, [this.generateId(gameId)]);
            return rows.length ? rows[0].score : 0n
        } finally {
            if (conn) conn.release();
        }
    }

    async addToLeaderboard(gameId: string, score: Score) {
        let conn;
        try {
            conn = await this.pool.getConnection();
            const query = "insert into highscores(id, name, score) value (?, ?, ?)";
            await conn.query(query, [this.generateId(gameId), score.nickname, score.score]);
        } finally {
            if (conn) conn.release();
        }
    }

    async updateLeaderboard(gameId: string, score: Score) {
        let conn;
        try {
            conn = await this.pool.getConnection();
            const query = "update highscores set name = ?, score = ? where id = ?";
            await conn.query(query, [score.nickname, score.score, this.generateId(gameId)]);
        } finally {
            if (conn) conn.release();
        }
    }

    async getLeaderboardPosition(gameId: string): Promise<[id: bigint, rowNumber: bigint]> {
        let conn;
        try {
            conn = await this.pool.getConnection();
            const dbId = this.generateId(gameId);
            const posQuery = "select row_number_ from (select id, row_number() over (order by score desc, id asc) as row_number_ from highscores) sub where id = ?";
            const pos: RowNumberQueryResult = await conn.query(posQuery, [dbId]);
            return [dbId, pos[0].row_number_];
        } finally {
            if (conn) conn.release();
        }
    }

    async addToLeaderboardBot(gameId: string, score: Score) {
        let conn;
        try {
            conn = await this.pool.getConnection();
            const select = "select id, score from highscores where name = ? limit 1";
            const rows: DbLeaderboardRow[] = await conn.query(select, [score.nickname]);
            if (rows.length) {
                if (rows[0].score >= score.score) {
                    return;
                }
                const query = "update highscores set name = ?, score = ? where id = ?";
                await conn.query(query, [score.nickname, score.score, rows[0].id]);
            } else {
                const query = "insert into highscores(id, name, score) value (?, ?, ?)";
                await conn.query(query, [this.generateId(gameId), score.nickname, score.score]);
            }
        } finally {
            if (conn) conn.release();
        }
    }

    async deleteBotsFromLeaderboard() {
        let conn;
        try {
            conn = await this.pool.getConnection();
            const deleteBots = "delete from highscores where name like 'BOT %'";
            await conn.query(deleteBots);
        } finally {
            if (conn) conn.release();
        }
    }
}