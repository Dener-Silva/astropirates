import { Container, Graphics } from "pixi.js";

export class AsteroidBelt extends Graphics {

    constructor(stage: Container) {
        super();
        this.lineStyle(4, 0xFFFFFF)
        this.drawCircle(0, 0, 1600)
        stage.addChild(this);
    }

    update(x: number, y: number): void {
        this.alpha = Math.max(Math.hypot(x, y) - 1200, 0) / 400;
    }
}