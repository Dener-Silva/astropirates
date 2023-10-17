import { Application, Container } from "pixi.js";
import { Dictionary, GameUpdate, Player, angleLerp, lerp, GameObjectState, Bullet, PlayerAttributes } from "dtos";
import { ShipGraphics } from "./rendering/ShipGraphics.js";
import { Stars } from "./rendering/Stars.js";
import { BulletGraphics } from "./rendering/BulletGraphics.js";
import { AsteroidBelt } from "./rendering/AsteroidBelt.js";
import { Emitter, EmitterConfigV3 } from "@pixi/particle-emitter";
import PlayerEmitter from "./rendering/emitters/PlayerEmitter.js"
import BulletEmitter from "./rendering/emitters/BulletEmitter.js";

interface Layers {
    background: Container;
    foreground: Container;
    player: Container;
    explosions: Container;
}

export class Renderer {

    layers: Layers;
    myId: string | undefined = undefined;
    serverDelta: number = 50;
    playerGraphics: Dictionary<ShipGraphics> = {};
    bulletGraphics: Dictionary<BulletGraphics> = {};
    players: Dictionary<Player> = {};
    previousPlayers: Dictionary<Player> = {};
    bullets: Dictionary<Bullet> = {};
    previousBullets: Dictionary<Bullet> = {};
    lastServerUpdate = performance.now();
    stars: Stars;
    asteroidBelt: AsteroidBelt;

    constructor(private app: Application) {

        this.layers = {
            background: new Container(),
            foreground: new Container(),
            player: new Container(),
            explosions: new Container(),
        }

        app.stage.addChild(...Object.values(this.layers));
        this.stars = new Stars(this.layers.background);
        this.asteroidBelt = new AsteroidBelt(this.layers.background);
    }

    update() {

        const now = performance.now();
        let timeSinceNextTick = Math.min(now - this.lastServerUpdate, 2 * this.serverDelta);
        let interpolationFactor = timeSinceNextTick / this.serverDelta;

        for (const [id, player] of Object.entries(this.players)) {
            const previousPosition = this.previousPlayers[id];
            let ship = this.playerGraphics[id];
            if (!ship) {
                console.warn('playerGraphics not found for ID', id);
                continue;
            }
            if (previousPosition) {
                ship.x = lerp(previousPosition.x, player.x, interpolationFactor);
                ship.y = lerp(previousPosition.y, player.y, interpolationFactor);
                ship.graphics.rotation = angleLerp(previousPosition.rotation, player.rotation, interpolationFactor);
            } else {
                ship.x = player.x;
                ship.y = player.y;
                ship.graphics.rotation = player.rotation;
            }

            // Blinking animation if player is invulnerable
            if (player.state === GameObjectState.Invulnerable) {
                ship.graphics.alpha = now % 300 < 200 ? 0.5 : 1;
            } else if (ship.graphics.alpha !== 1) {
                ship.graphics.alpha = 1;
            }

            // Move camera to follow the player.
            // Do note that we follow the visual position, not the actual one.
            if (id === this.myId) {
                this.app.stage.pivot.x = ship.x;
                this.app.stage.pivot.y = ship.y;
                this.stars.update(ship.x, ship.y);
                this.asteroidBelt.update(ship.x, ship.y);
            }
        }

        for (const [id, bullet] of Object.entries(this.bullets)) {
            const previousPosition = this.previousBullets[id];
            let bulletGraphics = this.bulletGraphics[id];
            if (!bulletGraphics) {
                console.warn('bulletGraphics not found for ID', id);
                continue;
            }
            if (previousPosition) {
                bulletGraphics.x = lerp(previousPosition.x, bullet.x, interpolationFactor);
                bulletGraphics.y = lerp(previousPosition.y, bullet.y, interpolationFactor);
            } else {
                bulletGraphics.x = bullet.x;
                bulletGraphics.y = bullet.y;
            }
        }
    }

    addPlayer(id: string, newPlayer: PlayerAttributes) {
        // The player has their own layer, so they can't be drawn behind other players
        const layer = id === this.myId ? this.layers.player : this.layers.foreground;
        const ship = new ShipGraphics(newPlayer.nickname, layer);
        this.playerGraphics[id] = ship;
    }

    private removePlayer(id: string) {
        const graphics = this.playerGraphics[id];
        graphics?.parent.removeChild(graphics);
        delete this.playerGraphics[id];
        delete this.players[id];
        delete this.previousPlayers[id];
    }

    private removeBullet(id: string) {
        const graphics = this.bulletGraphics[id];
        graphics?.parent.removeChild(graphics);
        delete this.bulletGraphics[id];
        delete this.bullets[id];
        delete this.previousBullets[id];
    }

    private emitParticles(point: { x: number, y: number }, config: EmitterConfigV3) {
        const emitter = new Emitter(this.layers.explosions, config);
        emitter.spawnPos.set(point.x, point.y);
        emitter.playOnceAndDestroy();
    }

    serverUpdate(gameUpdate: GameUpdate) {
        this.lastServerUpdate = performance.now();
        this.previousPlayers = this.players;
        this.players = { ...gameUpdate.players };
        this.previousBullets = this.bullets;
        this.bullets = gameUpdate.bullets;

        // Add and delete game objects
        for (const [id, player] of Object.entries(this.players)) {
            if (player.state >= GameObjectState.ToBeRemoved) {
                if (player.state === GameObjectState.Exploded) {
                    this.emitParticles(player, PlayerEmitter);
                }
                // Remove exploded/offline players
                this.removePlayer(id);
            }
            // Player graphics are added on the event "NewPlayer".
        }
        for (const [id, bullet] of Object.entries(this.bullets)) {
            if (bullet.state >= GameObjectState.ToBeRemoved) {
                if (bullet.state === GameObjectState.Exploded) {
                    this.emitParticles(bullet, BulletEmitter);
                }
                // Remove expired/exploded bullets
                this.removeBullet(id);
            } else {
                // Add new bullets
                let bulletGraphics = this.bulletGraphics[id];
                if (!bulletGraphics) {
                    this.bulletGraphics[id] = new BulletGraphics(this.layers.foreground);
                }
            }
        }

    }
}