import { GetLeaderboard, LeaderboardRow } from 'dtos';
import mariadb, { Pool } from 'mariadb'

type DbLeaderboardRow = { id: bigint, name: string, score: bigint, ts: Date, rank_: bigint }

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

    // const res = await conn.query("INSERT INTO highscores(name, score) value (?, ?)", ["Technocat", 100]);
}