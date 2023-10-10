import { Container, Graphics } from "pixi.js";

export class BulletGraphics extends Graphics {

    constructor(stage: Container) {
        super();
        this.lineStyle(0)
        this.beginFill(0xFFFFFF);
        this.drawCircle(0, 0, 4)
        this.endFill();
        stage.addChild(this);
    }
}