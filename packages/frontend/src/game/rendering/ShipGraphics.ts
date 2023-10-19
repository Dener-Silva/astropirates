import { Container, Graphics, Text } from "pixi.js";

const graphics = new Graphics()
graphics.lineStyle(2, 0xFFFFFF, 1);
graphics.beginFill(0x000000);
graphics.drawPolygon([-45, -30, -15, 0, -45, 30, 45, 0]);
graphics.endFill();
const geometry = graphics.geometry;

export class ShipGraphics extends Container {

    graphics: Graphics;

    constructor(nickname: string, stage: Container) {
        super();
        const graphics = this.graphics = new Graphics(geometry);
        this.addChild(graphics);
        const text = new Text(nickname, {
            fontFamily: 'Urbanist',
            fontSize: 24,
            fill: 0xffffff,
            align: 'center',
            strokeThickness: 5,
        });
        text.anchor.set(0.5, 0.5);
        text.resolution = stage.parent.scale.x;
        text.y = -75
        this.addChild(text);
        stage.addChild(this);
    }
}