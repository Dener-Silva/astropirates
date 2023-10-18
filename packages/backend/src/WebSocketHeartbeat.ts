import { WebSocket, WebSocketServer } from "ws";

const ponged = new WeakSet<WebSocket>();

export function webSocketHeartbeat(wss: WebSocketServer) {
    wss.on('connection', (ws) => {
        ponged.add(ws);
        ws.on('pong', () => ponged.add(ws));
    });

    // Heartbeat
    setInterval(() => {
        for (const ws of wss.clients) {
            if (ponged.delete(ws)) {
                ws.ping();
            } else {
                console.log('Terminating connection because it did not respond to ping');
                ws.terminate();
            }
        }
    }, 30000);
}
