import { Game } from './game.js';
import { GameStateAsteroids } from './gameStateAsteroids.js';

window.addEventListener('DOMContentLoaded', () => {
    let game = new Game();

    game.gameStates.push(new GameStateAsteroids(game));

    game.play();
});