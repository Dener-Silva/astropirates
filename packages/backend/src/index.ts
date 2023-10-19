import http from 'http';
import https from 'https';
import fs from 'fs';
import { AddressInfo, WebSocketServer } from 'ws';
import { GameWebSocketRunner } from './GameWebSocketRunner.js';
import dotenv from 'dotenv';
import { GameServer } from './GameServer.js';
import { SweepAndPrune } from './collision/SweepAndPrune.js';
import { delta } from './delta.js';
import { AI } from './AI.js';
import { webSocketHeartbeat } from './WebSocketHeartbeat.js';
import mariadb from 'mariadb'
import { ServerTopic } from 'dtos';
dotenv.config({ path: `.env.${process.env.NODE_ENV || 'production'}` })

function sayHello(_req: any, res: any) {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.write(`{ "time": "${new Date().toISOString()}"}`);
    res.end();
}

function createServer() {
    if (process.env.SSL_CERT_PATH && process.env.SSL_KEY_PATH) {
        console.log('SSL is enabled');
        return https.createServer({
            cert: fs.readFileSync(process.env.SSL_CERT_PATH),
            key: fs.readFileSync(process.env.SSL_KEY_PATH)
        }, sayHello);
    } else {
        console.log('SSL is disabled');
        return http.createServer(sayHello);
    }
}

const port = Number(process.env.PORT);
const server = createServer();

const gameServer = new GameServer(new SweepAndPrune());
const wss = new WebSocketServer({ server });
webSocketHeartbeat(wss);
const webSocketServer = new GameWebSocketRunner(wss, gameServer);
const ai = new AI(wss, gameServer, webSocketServer);

// Using setImmediate so the tickrate can be read from the dotenv file.
setImmediate(() =>
    setInterval(() => {
        const gameUpdate = gameServer.update();
        webSocketServer.onGameUpdate({
            topic: ServerTopic.FullGameUpdate,
            ...gameUpdate
        });
        ai.onGameUpdate(gameUpdate);
        gameServer.cleanup();
    }, delta)
)

server.listen(port, () => {
    const address = server.address() as AddressInfo;
    console.log(`Listening on port ${address.port}`);
});

























const pool = mariadb.createPool({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    database: process.env.DB_DATABASE,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD
});

async function asyncFunction() {
    let conn;
    try {

        conn = await pool.getConnection();
        const rows = await conn.query("SELECT 1 as val");
        // rows: [ {val: 1}, meta: ... ]

        const res = await conn.query("INSERT INTO highscores(name, score) value (?, ?)", ["Technocat", 100]);
        // res: { affectedRows: 1, insertId: 1, warningStatus: 0 }

    } finally {
        if (conn) conn.release(); //release to pool
    }
}

// asyncFunction();