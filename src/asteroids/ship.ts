import { GameStateAsteroids } from "../gameStateAsteroids.js";
import { Geometry } from "./geometry.js";

export class Ship extends Geometry {
    isEngineOn = false;
    shipSpeed = 6;
    shipMaxSpeed = 15;
    rotationSpeed = 4;
    speedMultiplier = 1.0;
    isDoubled = false;
    doublerTimer = 0;

    constructor(x: number, y: number, scale: number, ctx: CanvasRenderingContext2D) {
        super(x, y, scale);

        //this.isIgnoringCamera = true;

        this.points = [
            { action: 'l', x: -0.5, y: 0.5 },
            { action: 'l', x: 0, y: -0.5 },
            { action: 'l', x: 0.5, y: 0.5 },
            { action: 'l', x: 0, y: 0 }
        ];

        this.strokeStyle = ctx.createLinearGradient(0, -20, 0, 20);
        this.strokeStyle.addColorStop(0, 'white');
        this.strokeStyle.addColorStop(0.2, '#666666');
        this.strokeStyle.addColorStop(0.8, '#666666')
        this.strokeStyle.addColorStop(1, 'white');

        this.hitbox = {
            x: -0.5,
            y: -0.5,
            width: 1,
            height: 1
        }
    }

    update(delta: number, game: GameStateAsteroids) {
        super.update(delta, game);

        /*
        this.xVel -= this.xVel * 0.25 * delta;
        this.yVel -= this.yVel * 0.25 * delta;
        */

        if (this.isEngineOn) {
            this.xVel += this.shipSpeed * delta * Math.cos(this.angle - Math.PI / 2);
            this.yVel += this.shipSpeed * delta * Math.sin(this.angle - Math.PI / 2);
        }

        
        let vel = Math.sqrt((this.xVel * this.xVel) + (this.yVel * this.yVel));

        if (vel > this.shipMaxSpeed) {
            this.xVel = this.xVel * (this.shipMaxSpeed / vel);
            this.yVel = this.yVel * (this.shipMaxSpeed / vel);
        }
        
        this.doublerTimer -= delta;
        if (this.doublerTimer <= 0) {
            this.isDoubled = false;
            this.doublerTimer = 0;
        }
    }
}

export class Engine extends Geometry {
    engineSize = 0;

    engine1 = 0.7;
    engine2 = 0.5;
    engine3 = 0.9;

    constructor(public ship: Ship, ctx: CanvasRenderingContext2D) {
        super(ship.x, ship.y, ship.scale);
        this.strokeStyle = ctx.createLinearGradient(0, 0, 0, 35);
        this.strokeStyle.addColorStop(0, 'yellow');
        this.strokeStyle.addColorStop(0.75, 'orange');
        this.strokeStyle.addColorStop(1, 'red');

        this.points = [
            { action: 'm', x: -0.25, y: 0.25 },
            { action: 'l', x: -0.125, y: 10 },
            { action: 'l', x: 0, y: 1 },
            { action: 'l', x: 0.125, y: 8 },
            { action: 'l', x: 0.25, y: 0.25 }
        ]
        ctx.moveTo(-10, 10);
        ctx.lineTo(-5, 35 * this.engineSize);
        ctx.lineTo(0, 20 * this.engineSize);
        ctx.lineTo(5, 29 * this.engineSize);
        ctx.lineTo(10, 10);
    }

    update(delta: number, game: GameStateAsteroids) {
        super.update(delta, game);
        this.x = this.ship.x;
        this.y = this.ship.y;
        this.angle = this.ship.angle;
        this.isVisible = this.ship.isEngineOn;
        this.engineSize = Math.random() * 0.4 + 0.6;
        this.points[1].y = this.engine1 * this.engineSize;
        this.points[2].y = this.engine2 * this.engineSize;
        this.points[3].y = this.engine3 * this.engineSize;
    }
}