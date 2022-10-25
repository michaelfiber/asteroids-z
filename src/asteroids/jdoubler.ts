import { Geometry } from "./geometry.js";
import { Word } from "./word.js";

export class JDoubler extends Geometry {
    constructor(x: number, y: number, scale: number) {
        super(x, y, scale);
        
        this.isMirrored = false;

        this.points.push({ action: 'm', x: -0.2, y: -1 });
        this.points.push({ action: 'l', x: -2.2, y: -1 });
        this.points.push({ action: 'm', x: -2.2, y: -0.8 });
        this.points.push({ action: 'l', x: -0.2, y: -0.8 });
        this.points.push({ action: 'm', x: -0.8, y: -0.8 });
        this.points.push({ action: 'l', x: -0.8, y: 6 * 1.2 - 0.2 });
        this.points.push({ action: 'l', x: -1, y: 6 * 1.2 });
        this.points.push({ action: 'l', x: -2, y: 6 * 1.2 });
        this.points.push({ action: 'l', x: -2.2, y: 6 * 1.2 - 0.2 });
        this.points.push({ action: 'm', x: 0, y: 0 });

        let doubler = new Word('doubler', 0, 0, scale, true);
        doubler.points.forEach(p => this.points.push(p));

        this.hitbox = {
            x: -2.2,
            y: -1,
            width: 3.5,
            height: 8.5
        }
    }
}
