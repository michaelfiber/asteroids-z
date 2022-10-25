import { GameRect } from '../game.js';
import { GameStateAsteroids } from '../gameStateAsteroids.js';

export interface GeometryPoint {
    action: 'l' | 'm';
    x: number;
    y: number;
    group?: string;
}

export class Geometry {
    angle = 0;
    parallax = 1.0;
    flickerRate = 0.001;

    private _currentFlickerTime = 0;
    private _isFlickeredOut = false;

    isFlickering = false;
    isIgnoringCamera = false;
    isFilled = false;
    isMirrored = true;
    isVisible = true;
    
    fillStyle?: string | CanvasGradient | CanvasPattern;
    strokeStyle?: string | CanvasGradient | CanvasPattern;
    shadowColor?: string;
    shadowBlur: number = 0;

    done = false;
    points: Array<GeometryPoint> = [];
    
    overridePoint?: (point: GeometryPoint) => GeometryPoint;

    hitbox?: GameRect;

    get adjustedHitbox(): GameRect | undefined {
        if (!this.hitbox) return;
        return {
            x: this.hitbox.x * this.scale + this.x,
            y: this.hitbox.y * this.scale + this.y,
            width: this.hitbox.width * this.scale,
            height: this.hitbox.height * this.scale
        }
    }

    constructor(
        public x: number,
        public y: number,
        public scale: number,
        public xVel: number = 0,
        public yVel: number = 0,
        public aVel: number = 0
    ) { }

    update(delta: number, game: GameStateAsteroids) {
        this.x += this.xVel;
        this.y += this.yVel;
        this.angle += this.aVel;

        if (this.isFlickering) {
            this._currentFlickerTime += delta;
            if (this._currentFlickerTime > this.flickerRate) {
                this._isFlickeredOut = !this._isFlickeredOut;
                this._currentFlickerTime = 0;
            }
        }
    }

    draw(ctx: CanvasRenderingContext2D, width: number, height: number, camera: { x: number; y: number; }, overallScale: number) {
        if (!this.isVisible || this._isFlickeredOut) return;

        let drawScale = this.scale * this.parallax * overallScale;

        let c = (this.isIgnoringCamera ? { x: 0, y: 0 } : camera);
        let translateX = width / 2 + (this.x - c.x) * overallScale * this.parallax;
        let translateY = height / 2 + (this.y - c.y) * overallScale * this.parallax;

        ctx.strokeStyle = this.strokeStyle || 'green';
        ctx.translate(translateX, translateY);
        ctx.rotate(this.angle);

        if (typeof this.shadowColor == 'string') ctx.shadowColor = this.shadowColor;
        ctx.shadowBlur = this.shadowBlur;

        ctx.beginPath();

        ctx.moveTo(0, 0);
        this.points.forEach(p => {
            let point = p;

            if (this.overridePoint) {
                point = this.overridePoint(point);
            }

            if (p.action == 'l') ctx.lineTo(point.x * this.scale * overallScale, point.y * this.scale * overallScale);
            else if (p.action == 'm') ctx.moveTo(point.x * this.scale * overallScale, point.y * this.scale * overallScale);
        });

        if (this.isMirrored) {
            ctx.moveTo(0, 0);
            this.points.forEach(p => {
                let point = p;

                if (this.overridePoint) {
                    point = this.overridePoint(point);
                }

                if (p.action == 'l') ctx.lineTo(point.x * -1 * drawScale, point.y * drawScale);
                else if (p.action == 'm') ctx.moveTo(point.x * -1 * drawScale, point.y * drawScale);
            })
        }

        ctx.stroke();
        
        if (this.isFilled && this.fillStyle) {
            ctx.fillStyle = this.fillStyle;
            ctx.fill();
        }

        ctx.rotate(-this.angle);

        ctx.translate(-translateX, -translateY);
    }
}
