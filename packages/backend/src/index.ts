import http from 'http';
import https from 'https';
import fs from 'fs';
import { AddressInfo, WebSocketServer } from 'ws';
import { runWebSocketServer } from './webSocketServer.js';
import dotenv from 'dotenv';
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


// TODO: check origin
runWebSocketServer(new WebSocketServer({ server }));

server.listen(port, () => {
    const address = server.address() as AddressInfo;
    console.log(`Listening on port ${address.port}`);
});