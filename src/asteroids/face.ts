import { GameStateAsteroids } from "../gameStateAsteroids.js";
import { Geometry } from "./geometry.js";
import { Word } from "./word.js";

export class Face extends Geometry {

    isMouthOpen = false;
    mouthOpenAmount = 0;
    isMouthOpening = true;

    mouth1 = 0.95;
    mouth2 = 1.1;

    hitCount = 0;
    mouthSpeed = 1;

    constructor(x: number, y: number, scale: number) {
        super(x, y, scale);

        this.points = [
            { action: 'm', x: 0, y: -1 },
            { action: 'l', x: 1, y: -0.6 },
            { action: 'l', x: 1.2, y: 0 },
            { action: 'l', x: 1, y: 1.2 },
            { action: 'l', x: 0, y: 1.8 },
            { action: 'm', x: 0.2, y: -0.1 },
            { action: 'l', x: 0.7, y: -0.3 },
            { action: 'l', x: 1, y: 0.1 },
            { action: 'l', x: 0.2, y: -0.1 },
            { action: 'm', x: 0, y: 0.7 },
            { action: 'l', x: 0.6, y: 0.9 },
            { action: 'l', x: 0, y: 0.85 },
            { action: 'm', x: 0, y: 0.95, group: 'lower-lip' },
            { action: 'l', x: 0.6, y: 0.9 },
            { action: 'l', x: 0, y: 1.1, group: 'lower-lip' }
        ]

        this.hitbox = {
            x: -1.2,
            y: -1,
            width: 2.4,
            height: 2.8
        }
    }

    update(delta: number, game: GameStateAsteroids) {
        super.update(delta, game);

        if (this.hitCount == 1) this.mouthSpeed = 0.5;
        if (this.hitCount == 2) {
            this.mouthSpeed = 0;
            this.mouthOpenAmount = 0;
            game.addVaccinated(this.x, this.y);
            game.totalVaccinated++;
            this.done = true;
        }

        if (this.isMouthOpening) {
            this.mouthOpenAmount += delta * this.mouthSpeed;
        } else {
            this.mouthOpenAmount -= delta * this.mouthSpeed;
        }

        if (this.mouthOpenAmount < 0) {
            this.mouthOpenAmount = 0;
            this.isMouthOpening = true;
        }

        if (this.mouthOpenAmount > 0.5) {
            this.mouthOpenAmount = 0.5;
            this.isMouthOpening = false;
            this.isMouthOpen = true;
        } else {
            this.isMouthOpen = false;
        }

        this.points[12].y = this.mouth1 + this.mouthOpenAmount;
        this.points[14].y = this.mouth2 + this.mouthOpenAmount;
    }
}