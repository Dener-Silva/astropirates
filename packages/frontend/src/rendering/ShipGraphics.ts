import { Container, Graphics } from "pixi.js";

export class ShipGraphics extends Graphics {

    constructor(stage: Container) {
        super();
        this.lineStyle(2, 0xFFFFFF, 1);
        this.beginFill(0x000000);
        this.drawPolygon([-45, -30, -15, 0, -45, 30, 45, 0]);
        this.endFill();
        stage.addChild(this);
    }
}