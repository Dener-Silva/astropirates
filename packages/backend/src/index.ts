import cors from 'cors';
import express from 'express';
import http from 'http';
import { WebSocketServer } from 'ws';

const app = express()
const port = 5000
const server = http.createServer(app);

app.use(cors({ origin: 'http://localhost:3000' }))

app.get('/hello', (_, response) => {
    response.json({ hello: "world" })
})

const wss = new WebSocketServer({ server });
wss.on('connection', function connection(ws) {
    ws.on('error', console.error);

    ws.on('message', function message(data) {
        console.log('received: %s', data);
    });

    ws.send('something');
});

server.listen(port, () => {
    console.log(`Listening on port ${port}`);
});