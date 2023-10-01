import { Application, Container, Graphics, Text } from "pixi.js";
import { Dictionary, GameUpdate, Player, angleLerp, lerp } from "dtos";
import { serverDelta } from "../delta.js";
import { ShipGraphics } from "./ShipGraphics.js";
import { Stars } from "./Stars.js";

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
    players: Dictionary<Player> = {};
    previousPlayers: Dictionary<Player> = {};
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

        let timeSinceNextTick = Math.min(performance.now() - this.lastServerUpdate, 2 * serverDelta);
        let interpolationFactor = timeSinceNextTick / serverDelta;

        for (const [id, player] of Object.entries(this.players)) {
            const previousPosition = this.previousPlayers[id];
            let ship = this.playerGraphics[id];
            if (ship && previousPosition) {
                ship.x = lerp(previousPosition.x, player.x, interpolationFactor);
                ship.y = lerp(previousPosition.y, player.y, interpolationFactor);
                ship.graphics.rotation = angleLerp(previousPosition.rotation, player.rotation, interpolationFactor);
            }
            if (!ship) {
                // The player has their own layer, so they can't be drawn behind other players
                const layer = id === this.myId ? this.layers.player : this.layers.foreground;
                ship = new ShipGraphics('Test', layer);
                ship.x = player.x;
                ship.y = player.y;
                ship.graphics.rotation = player.rotation;
                this.playerGraphics[id] = ship;
            }

            // Move camera to follow the player.
            // Do note that we follow the visual position, not the actual one.
            if (id === this.myId) {
                this.app.stage.pivot.x = ship.x;
                this.app.stage.pivot.y = ship.y;
                this.stars.update(ship.x, ship.y);
            }
        }
    }

    serverUpdate(gameUpdate: GameUpdate) {
        this.lastServerUpdate = performance.now();
        this.previousPlayers = this.players;
        this.players = gameUpdate.players;
    }
}