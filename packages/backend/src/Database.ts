import { GetLeaderboard, LeaderboardRow } from 'dtos';
import mariadb, { Pool } from 'mariadb'

type DbLeaderboardRow = { id: bigint, name: string, score: bigint, ts: Date, rank_: bigint }
type DbInsertResult = { affectedRows: number, insertId: bigint, warningStatus: number }

export class Database {

    pool: Pool

    constructor() {
        this.pool = mariadb.createPool({
            host: process.env.DB_HOST,
            port: Number(process.env.DB_PORT),
            database: process.env.DB_DATABASE,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD
        });
    }

    async getLeaderboard(params: GetLeaderboard): Promise<[LeaderboardRow[], bigint]> {
        let conn;
        try {
            conn = await this.pool.getConnection();
            const query = "select *, rank() over (order by score desc) as rank_ from highscores order by rank_, id limit ? offset ?";
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

    async addToLeaderboard(nickname: string, score: number): Promise<[id: bigint, rowNumber: bigint]> {
        let conn;
        try {
            conn = await this.pool.getConnection();
            const query = "insert into highscores(name, score) value (?, ?)";
            const result: DbInsertResult = await conn.query(query, [nickname, score]);
            const posQuery = "select row_number_ from (select id, row_number() over (order by score desc, id asc) as row_number_ from highscores) sub where id = ?"
            const pos: [{ row_number_: bigint }] = await conn.query(posQuery, [result.insertId]);
            return [result.insertId, pos[0].row_number_];
        } finally {
            if (conn) conn.release();
        }
    }

    async addToLeaderboardBot(nickname: string, score: number) {
        let conn;
        try {
            conn = await this.pool.getConnection();
            const select = "select score from highscores where name = ? limit 1";
            const rows: DbLeaderboardRow[] = await conn.query(select, [nickname]);
            if (rows.length) {
                if (rows[0].score >= score) {
                    return;
                }
                const query = "update highscores set name = ?, score = ? where id = ?";
                await conn.query(query, [nickname, score, rows[0].id]);
            } else {
                const query = "insert into highscores(name, score) value (?, ?)";
                await conn.query(query, [nickname, score]);
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