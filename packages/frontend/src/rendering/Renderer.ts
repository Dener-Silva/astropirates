import { Application, Container } from "pixi.js";
import { Dictionary, GameUpdate, PlayerAttributes, Player, angleLerp, lerp, GameObjectState, Bullet } from "dtos";
import { serverDelta } from "../delta.js";
import { ShipGraphics } from "./ShipGraphics.js";
import { Stars } from "./Stars.js";
import { BulletGraphics } from "./BulletGraphics.js";

interface Layers {
    background: Container;
    foreground: Container;
    player: Container;
    ui: Container;
}

export class Renderer {

    layers: Layers;
    myId: string | undefined = undefined;
    playerGraphics: Dictionary<ShipGraphics> = {};
    bulletGraphics: Dictionary<BulletGraphics> = {};
    players: Dictionary<Player> = {};
    previousPlayers: Dictionary<Player> = {};
    bullets: Dictionary<Bullet> = {};
    previousBullets: Dictionary<Bullet> = {};
    lastServerUpdate = performance.now();
    stars: Stars;

    constructor(private app: Application) {

        this.layers = {
            background: new Container(),
            foreground: new Container(),
            player: new Container(),
            ui: new Container()
        }

        app.stage.addChild(...Object.values(this.layers));
        this.stars = new Stars(this.layers.background);
    }

    update() {

        // Clean dead GameObjects
        for (const [id, player] of Object.entries(this.players)) {
            if (player.state >= GameObjectState.ToBeRemoved) {
                this.removePlayer(id);
                if (player.state === GameObjectState.Exploded) {
                    // TODO explode animation
                }
            }
        }
        for (const [id, bullet] of Object.entries(this.bullets)) {
            if (bullet.state >= GameObjectState.ToBeRemoved) {
                this.removeBullet(id);
                if (bullet.state === GameObjectState.Exploded) {
                    // TODO explode animation
                }
            }
        }

        let timeSinceNextTick = Math.min(performance.now() - this.lastServerUpdate, 2 * serverDelta);
        let interpolationFactor = timeSinceNextTick / serverDelta;

        for (const [id, player] of Object.entries(this.players)) {

            const previousPosition = this.previousPlayers[id];
            let ship = this.playerGraphics[id];
            // Player graphics are added on the event "NewPlayer".
            if (!ship) {
                console.error('playerGraphics not found for ID', id);
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

            // Move camera to follow the player.
            // Do note that we follow the visual position, not the actual one.
            if (id === this.myId) {
                this.app.stage.pivot.x = ship.x;
                this.app.stage.pivot.y = ship.y;
                this.stars.update(ship.x, ship.y);
            }
        }

        for (const [id, bullet] of Object.entries(this.bullets)) {
            let bulletGraphics = this.bulletGraphics[id];
            // Bullets graphics are automatically added if their ID is unseen.
            if (!bulletGraphics) {
                this.bulletGraphics[id] = bulletGraphics = new BulletGraphics(this.layers.foreground);
            }
            const previousPosition = this.previousBullets[id];
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

    serverUpdate(gameUpdate: GameUpdate) {
        this.lastServerUpdate = performance.now();
        this.previousPlayers = this.players;
        this.players = gameUpdate.players;
        this.previousBullets = this.bullets;
        this.bullets = gameUpdate.bullets;
    }
}