import { Application, Container, Graphics } from "pixi.js";
import { Layers } from "./RenderingLayers.js";
import { GameUpdate, ServerTopic, angleLerp, lerp } from "dtos";
import { serverDelta } from "../delta.js";
import { ShipGraphics } from "./ShipGraphics.js";

export class Renderer {

    layers: Layers;
    myId: number | undefined = undefined;
    graphics = new Map<number, Graphics>();
    // Start with empty positions until the first update from server
    positions: { x: number, y: number, rotation: number, id: number }[] = [];
    previousPositions: { x: number, y: number, rotation: number, id: number }[] = [];
    lastServerUpdate = performance.now();

    constructor(private app: Application) {

        this.layers = {
            background: new Container(),
            foreground: new Container(),
            ui: new Container()
        }

        // TODO remove dummy
        let dummy = new Graphics();
        dummy.lineStyle(10, 0xffffff, 0.5);
        dummy.drawRect(5, 5, 100, 100);
        this.layers.background.addChild(dummy);

        app.stage.addChild(...Object.values(this.layers));
    }

    update() {

        let timeSinceNextTick = Math.min(performance.now() - this.lastServerUpdate, 2 * serverDelta);
        let interpolationFactor = timeSinceNextTick / serverDelta;

        for (let i = 0; i < this.positions.length; i++) {
            const position = this.positions[i]
            const previousPosition = this.previousPositions[i];
            let graphics = this.graphics.get(position.id);
            if (graphics && previousPosition) {
                graphics.x = lerp(previousPosition.x, position.x, interpolationFactor);
                graphics.y = lerp(previousPosition.y, position.y, interpolationFactor);
                graphics.rotation = angleLerp(previousPosition.rotation, position.rotation, interpolationFactor);
            }
            if (!graphics) {
                graphics = new ShipGraphics(this.layers.foreground);
                graphics.x = position.x;
                graphics.y = position.y;
                graphics.rotation = position.rotation;
                this.graphics.set(position.id, graphics);
            }

            // Move camera to follow the player.
            // Do note that we follow the visual position, not the actual one.
            if (position.id === this.myId) {
                this.app.stage.pivot.x = graphics.x;
                this.app.stage.pivot.y = graphics.y;
            }
        }
    }

    serverUpdate(gameUpdate: GameUpdate) {
        this.lastServerUpdate = performance.now();
        this.previousPositions = this.positions;
        this.positions = gameUpdate.positions;
    }
}