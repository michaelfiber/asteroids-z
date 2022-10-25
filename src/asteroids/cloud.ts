import { GameStateAsteroids } from '../gameStateAsteroids.js';
import { Geometry } from './geometry.js';

export class Cloud extends Geometry {
    isGrowing = true;
    originalScale = 0;
    visibleCountdown = 0;

    constructor(x: number, y: number, scale: number, xVel: number = 0, yVel: number = 0, aVel: number = 0) {
        super(x, y, scale, xVel, yVel, aVel);
        this.strokeStyle = 'purple';
        this.originalScale = this.scale;

        this.isMirrored = false;
        this.points = [
            { action: 'm', x: -1, y: 2.5 },
            { action: 'l', x: -2, y: 0.5 },
            { action: 'l', x: -1.7, y: -3.5 },
            { action: 'l', x: 0, y: -1.5 },
            { action: 'l', x: 3, y: -3.5 },
            { action: 'l', x: 4, y: 1 },
            { action: 'l', x: 2, y: 2.25 },
            { action: 'l', x: 0, y: 2.5 },
            { action: 'l', x: -1, y: 2.5 }
        ]

        this.hitbox = {
            x: -2,
            y: -3.5,
            width: 6,
            height: 7
        }
    }
    update(delta: number, game: GameStateAsteroids) {
        super.update(delta, game);

        this.visibleCountdown -= delta;
        if (this.visibleCountdown < 0) {
            this.visibleCountdown = 0.04;
            this.isVisible = !this.isVisible;
        }

        if (this.isGrowing) {
            this.scale += 2 * delta;
            if (this.scale >= this.originalScale * game.overallScale) this.isGrowing = false;
        } else {
            this.scale -= 3 * delta;
            if (this.scale < 0) {
                this.scale = 0;
                this.done = true;
            }
        }
    }
}
