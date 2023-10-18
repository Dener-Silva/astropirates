import { GameUpdate, Input, Dictionary, ServerTopic, GameObjectState, ClientTopic } from 'dtos';
import { Player } from './Player.js';
import { SweepAndPrune } from './collision/SweepAndPrune.js';
import { Polygon } from './collision/colliders/Polygon.js';
import { Bullet } from './Bullet.js';
import { newId } from './newId.js';

function randomPosition() {
    let x, y;
    do {
        x = Math.random() - 0.5;
        y = Math.random() - 0.5;
    } while (Math.hypot(x, y) > 0.5)

    return [x * 3200, y * 3200]
}

export class GameServer {
    players: Dictionary<Player> = {};
    bullets: Dictionary<Bullet> = {};
    inputBuffers: Dictionary<Input[]> = {};
    lastInputs: Dictionary<Input> = {};

    constructor(private sweepAndPrune: SweepAndPrune) { }

    addPlayer(id: string, nickname: string, onDestroyed: (byWhom: string) => void): Player | null {
        if (Object.values(this.players).some((p) => p.nickname === nickname)) {
            return null;
        }
        const collider = new Polygon([-45, -30, -45, 30, 45, 0]);
        this.sweepAndPrune.add(collider);
        const player = new Player(id, nickname, collider, onDestroyed, ...randomPosition());
        this.players[id] = player;
        this.inputBuffers[id] = [];
        return player;
    }

    onPlayerLoggedOut(id: string) {
        if (process.env.NODE_ENV !== 'test') {
            console.debug(`Bye ${this.players[id]?.nickname} (ID ${id})`)
        }
        const player = this.players[id];
        if (player) {
            player.state = GameObjectState.Offline;
        }
    }

    private removePlayer(id: string) {
        const player = this.players[id];
        this.sweepAndPrune.remove(player?.collider);
        delete this.players[id];
        delete this.inputBuffers[id];
        delete this.lastInputs[id];
    }

    registerInputs(id: string, input: Input) {
        const inputBuffer = this.inputBuffers[id];
        if (inputBuffer && inputBuffer.unshift(input) > 2) {
            inputBuffer.pop();
        }
    }

    update(): GameUpdate {
        // Proccess bullet updates before inputs, so players can see the first frame
        for (const bullet of Object.values(this.bullets)) {
            bullet.update();
        }

        // Proccess inputs
        for (const [id, inputBuffer] of Object.entries(this.inputBuffers)) {
            if (!inputBuffer) {
                continue;
            }
            // Get input from buffer first
            let input = inputBuffer.pop();
            if (input) {
                this.lastInputs[id] = input;
            } else {
                // Buffer is empty, reuse last known input
                input = this.lastInputs[id];
            }
            if (!input) {
                continue;
            }
            const player = this.players[id]!;
            player.move(input);
            if (input.shoot && player.canShoot) {
                const bullet = player.shoot();
                const id = newId();
                this.sweepAndPrune.add(bullet.collider);
                this.bullets[id] = bullet;
            }
        }

        // Proccess player updates
        for (const player of Object.values(this.players)) {
            player.update();
        }

        // Proccess collisions
        for (const [a, b] of this.sweepAndPrune.update()) {
            if (a.collidesWith(b)) {
                a.owner!.onCollision(b.owner);
                b.owner!.onCollision(a.owner);
            }
        }

        const state: GameUpdate = {
            topic: ServerTopic.GameUpdate,
            players: this.players,
            bullets: this.bullets
        }
        return state;
    }

    /**
     * Clean dead GameObjects after the game loop
     */
    cleanup() {
        for (const [id, player] of Object.entries(this.players)) {
            if (player.state >= GameObjectState.ToBeRemoved) {
                this.removePlayer(id)
            }
        }
        for (const [id, bullet] of Object.entries(this.bullets)) {
            if (bullet.state >= GameObjectState.ToBeRemoved) {
                delete this.bullets[id];
                this.sweepAndPrune.remove(bullet.collider);
            }
        }
    }
}