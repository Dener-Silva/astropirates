import cors from 'cors';
import express from 'express';
import http from 'http';
import { WebSocketServer } from 'ws';
import { runWebSocketServer } from './webSocketServer.js';
import dotenv from 'dotenv';
dotenv.config();

const app = express()
const port = process.env.PORT
const server = http.createServer(app);

app.use(cors({ origin: 'http://localhost:3000' }))

app.get('/hello', (_, response) => {
    response.json({ hello: "world" })
})

runWebSocketServer(new WebSocketServer({ server }));

server.listen(port, () => {
    console.log(`Listening on port ${port}`);
});