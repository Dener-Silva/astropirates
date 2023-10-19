import { Container, Graphics } from "pixi.js";

const graphics = new Graphics();
graphics.lineStyle(0)
graphics.beginFill(0xFFFFFF);
graphics.drawCircle(0, 0, 4)
graphics.endFill();
const geometry = graphics.geometry;

export class BulletGraphics extends Graphics {

    constructor(stage: Container) {
        super(geometry);
        stage.addChild(this);
    }
}