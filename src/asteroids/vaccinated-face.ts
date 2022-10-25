import { GameStateAsteroids } from "../gameStateAsteroids.js";
import { Geometry } from "./geometry.js";
import { Word } from "./word.js";

export class VaccinatedFace extends Geometry {
    lifetime = 0;

    constructor(x: number, y: number, scale: number) {
        super(x, y, scale);
        this.isMirrored = false;

        let word = new Word('vaccinated', 0, 0, 1);
        word.points.forEach(p => this.points.push(p));
    }

    update(delta: number, game: GameStateAsteroids) {
        this.lifetime += delta;
        if (this.lifetime > 1) this.done = true;
    }
}