import { Application, Container, Graphics, Text } from "pixi.js";
import { GameUpdate, angleLerp, lerp } from "dtos";
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
    myId: number | undefined = undefined;
    playerGraphics = new Map<number, ShipGraphics>();
    // Start with empty positions until the first update from server
    positions: { x: number, y: number, rotation: number, id: number }[] = [];
    previousPositions: { x: number, y: number, rotation: number, id: number }[] = [];
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

        for (let i = 0; i < this.positions.length; i++) {
            const position = this.positions[i]
            const previousPosition = this.previousPositions[i];
            let ship = this.playerGraphics.get(position.id);
            if (ship && previousPosition) {
                ship.x = lerp(previousPosition.x, position.x, interpolationFactor);
                ship.y = lerp(previousPosition.y, position.y, interpolationFactor);
                ship.graphics.rotation = angleLerp(previousPosition.rotation, position.rotation, interpolationFactor);
            }
            if (!ship) {
                // The player has their own layer, so they can't be drawn behind other players
                const layer = position.id === this.myId ? this.layers.player : this.layers.foreground;
                ship = new ShipGraphics('Test', layer);
                ship.x = position.x;
                ship.y = position.y;
                ship.graphics.rotation = position.rotation;
                this.playerGraphics.set(position.id, ship);
            }

            // Move camera to follow the player.
            // Do note that we follow the visual position, not the actual one.
            if (position.id === this.myId) {
                this.app.stage.pivot.x = ship.x;
                this.app.stage.pivot.y = ship.y;
                this.stars.update(ship.x, ship.y);
            }
        }
    }

    serverUpdate(gameUpdate: GameUpdate) {
        this.lastServerUpdate = performance.now();
        this.previousPositions = this.positions;
        this.positions = gameUpdate.positions;
    }
}