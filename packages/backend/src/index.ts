import http from 'http';
import { AddressInfo, WebSocketServer } from 'ws';
import { runWebSocketServer } from './webSocketServer.js';
import dotenv from 'dotenv';
dotenv.config({ path: `.env.${process.env.NODE_ENV || 'production'}` })

const port = Number(process.env.PORT);
const server = http.createServer(function (_req, res) {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.write(`{ "time": "${new Date().toLocaleString()}"}`);
    res.end();
});

// TODO: check origin
runWebSocketServer(new WebSocketServer({ server }));

server.listen(port, () => {
    const address = server.address() as AddressInfo;
    console.log(`Listening on port ${address.port}`);
});