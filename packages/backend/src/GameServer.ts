import { GameUpdate, Input, Dictionary, ServerTopic, GameObjectState } from 'dtos';
import { Player } from './Player.js';
import { SweepAndPrune } from './collision/SweepAndPrune.js';
import { Polygon } from './collision/colliders/Polygon.js';
import { Bullet } from './Bullet.js';
import { newId } from './newId.js';

export class GameServer {
    players: Dictionary<Player> = {};
    bullets: Dictionary<Bullet> = {};
    inputs: Dictionary<Input> = {};

    constructor(private sweepAndPrune: SweepAndPrune) { }

    addPlayer(id: string, nickname: string): Player | null {
        if (Object.values(this.players).some((p) => p.nickname === nickname)) {
            return null;
        }
        if (process.env.NODE_ENV !== 'test') {
            console.debug(`Welcome ${nickname} (ID ${id})`)
        }
        const collider = new Polygon([-45, -30, -45, 30, 45, 0]);
        this.sweepAndPrune.add(collider);
        const player = new Player(nickname, collider);
        this.players[id] = player;
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
        delete this.inputs[id];
    }

    registerInputs(id: string, input: Input) {
        if (this.players[id]) {
            this.inputs[id] = input;
        }
    }

    update(): GameUpdate {
        // Proccess bullet updates before inputs, so players can see the first frame
        for (const bullet of Object.values(this.bullets)) {
            bullet.update();
        }

        // Proccess input
        for (const [id, input] of Object.entries(this.inputs)) {
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