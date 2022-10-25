import { GameStateAsteroids } from "../gameStateAsteroids.js";
import { Cloud } from "./cloud.js";
import { Face } from "./face.js";
import { Geometry } from "./geometry.js";
import { Ship } from "./ship.js";

export class Bullet extends Geometry {  
    lifespan = 0;

    constructor(ship: Ship, velocity: number, ctx: CanvasRenderingContext2D) {
        super(ship.x, ship.y, ship.scale, velocity * Math.sin(ship.angle), velocity * Math.cos(ship.angle - Math.PI));
        this.angle = ship.angle;
        this.points = [
            { action: 'm', x: 0, y: 1},
            { action: 'l', x: 0, y: 0}
        ];
        this.strokeStyle = ctx.createLinearGradient(0, 0, 0, 1 * this.scale);
        this.strokeStyle.addColorStop(0, '#33aa33');
        this.strokeStyle.addColorStop(0.2, '#66ff66');
        this.strokeStyle.addColorStop(1, '#aaffaa');
        this.hitbox = {
            x: -0.1,
            y: -0.1,
            width: 0.2,
            height: 0.2
        }
    }

    hit(item: Geometry, isDoubled: boolean) {
        if (item instanceof Cloud) {
            if (!isDoubled) this.done = true;
            item.done = true;
        } else if (item instanceof Face) {
            if (item.mouthSpeed > 0) item.hitCount++;
            if (isDoubled) item.hitCount = 2;
            this.done = true;
        }
    }

    update(delta: number, game: GameStateAsteroids) {
        super.update(delta, game);
        this.lifespan += delta;
        if (this.lifespan > 5) this.done = true;
    }
}