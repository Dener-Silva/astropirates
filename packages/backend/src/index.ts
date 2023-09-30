import cors from 'cors';
import express from 'express';
import http from 'http';
import { AddressInfo, WebSocketServer } from 'ws';
import { runWebSocketServer } from './webSocketServer.js';
import dotenv from 'dotenv';
dotenv.config({ path: `.env.${process.env.NODE_ENV || 'prod'}` })
console.log(process.env.NODE_ENV)

const app = express()
const port = Number(process.env.PORT);
const server = http.createServer(app);

app.use(cors({ origin: process.env.CORS_ORIGIN }))

app.get('/', (_, response) => {
    response.json({ hello: "world" })
})

runWebSocketServer(new WebSocketServer({ server }));

server.listen(port, () => {
    const address = server.address() as AddressInfo;
    console.log(`Listening on port ${address.port}`);
});