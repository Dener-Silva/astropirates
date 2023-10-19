import { GameUpdate, Input, Dictionary, ServerTopic, GameObjectState, FullGameUpdate, Score } from 'dtos';
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
    scoreboard: Dictionary<Score> = {};
    inputBuffers: Dictionary<Input[]> = {};
    lastInputs: Dictionary<Input> = {};

    constructor(private sweepAndPrune: SweepAndPrune) { }

    addPlayer(id: string, nickname: string, onDestroyed: (byWhom: string) => void): Player | null {
        for (const [existingId, score] of Object.entries(this.scoreboard)) {
            if (nickname === score.nickname && existingId !== id) return null;
        }
        const collider = new Polygon([-45, -30, -45, 30, 45, 0]);
        this.sweepAndPrune.add(collider);
        const increaseScore = (byWhom: string) => {
            // Player might already have logged out
            if (this.scoreboard[byWhom]) {
                this.scoreboard[byWhom].score += 100;
            }
            onDestroyed(byWhom);
        }
        const player = new Player(id, collider, increaseScore, ...randomPosition());
        this.players[id] = player;
        this.scoreboard[id] = { nickname, score: 0 };
        this.inputBuffers[id] = [];
        return player;
    }

    onPlayerLoggedOut(id: string) {
        const player = this.players[id];
        if (player) {
            player.state = GameObjectState.Offline;
        }
        delete this.scoreboard[id];
    }

    private removePlayer(id: string) {
        const player = this.players[id];
        this.sweepAndPrune.remove(player?.collider);
        delete this.players[id];
        delete this.inputBuffers[id];
        delete this.lastInputs[id];
        // Do not remove scores yet, only when the player is offline
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
            players: this.players,
            bullets: this.bullets,
            scoreboard: this.scoreboard
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