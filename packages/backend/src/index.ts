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
import { Database } from './Database.js';
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
const db = new Database();
const webSocketServer = new GameWebSocketRunner(wss, gameServer, db);
const ai = new AI(wss, gameServer, db);

// Using setImmediate so the tickrate can be read from the dotenv file.
setImmediate(() =>
    setInterval(() => {
        const gameUpdate = gameServer.update();
        // AI updates first, so players can receive the update before cleanup
        ai.onGameUpdate(gameUpdate);
        webSocketServer.onGameUpdate(gameUpdate);
        gameServer.cleanup();
    }, delta)
)

server.listen(port, () => {
    const address = server.address() as AddressInfo;
    console.log(`Listening on port ${address.port}`);
});
