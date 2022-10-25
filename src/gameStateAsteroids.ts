import { Geometry, GeometryPoint } from "./asteroids/geometry.js";
import { Button } from "./button.js";
import { Game, GameEvent, GameRect } from "./game.js";
import { GameState } from "./gameState.js";
import { JDoubler } from "./asteroids/jdoubler.js";
import { Grid } from "./asteroids/grid.js";
import { Engine, Ship } from "./asteroids/ship.js";
import { Bullet } from "./asteroids/bullet.js";
import { Cloud } from "./asteroids/cloud.js";
import { Face } from './asteroids/face.js';
import { isColliding } from "./util.js";
import { Word } from "./asteroids/word.js";
import { VaccinatedFace } from "./asteroids/vaccinated-face.js";
import { CloudLayer } from "./asteroids/cloud-layer.js";
import { Rectangle } from "./asteroids/rectangle.js";

export class GameStateAsteroids extends GameState {
    buttons: Button[] = [];

    private _lastTotalVaccinated = 0;
    totalVaccinated = 0;

    left = false;
    right = false;
    up = false;
    down = false;
    fire = false;

    camera: { x: number; y: number } = { x: 0, y: 0 };
    isMobile = false;

    get overallScale() {
        return this.isMobile ? 0.25 : 0.6;
    }

    ship: Ship;
    grid: Grid;
    cloudLayer: CloudLayer;
    lowerCloudLayer: CloudLayer;
    border: Rectangle;
    totalVaccinatedReadout: Word;
    title: Word;
    doublerAnnounce: Word;

    isFiring = false;
    shotCooldown = 1;
    currentShotCooldown = 0;

    faceCount = 0;

    //bullets: Bullet[] = [];
    geometries: Geometry[] = [];

    controlsDiv: HTMLDivElement = document.createElement('div');

    makeHtmlControls() {

        this.controlsDiv.classList.add('controls');
        
        this.controlsDiv.style.position = 'fixed';
        this.controlsDiv.style.bottom = '0';
        this.controlsDiv.style.left = '0';
        this.controlsDiv.style.right = '0';
        this.controlsDiv.style.zIndex = '99999';
        this.controlsDiv.style.font = '64px sans-serif';
        this.controlsDiv.style.display = 'flex';
        this.controlsDiv.style.flexDirection = 'row';
        this.controlsDiv.style.justifyContent = 'space-between';

        document.body.appendChild(this.controlsDiv);
        
        let left = document.createElement('button');
        left.innerHTML = '&larr;';
        left.style.width = '15vw';
        left.style.height = '7vw';
        left.style.fontSize = '16px';
        left.style.userSelect = 'none';

        left.addEventListener('touchstart', (ev) => {
            this.left = true;
            ev.preventDefault();
        });
        left.addEventListener('mousedown', (ev) => {
            this.left = true;
            ev.preventDefault();
        });

        left.addEventListener('touchend', (ev) => {
            this.left = false;
            ev.preventDefault();
        });
        left.addEventListener('mouseup', (ev) => {
            this.left = false;
            ev.preventDefault();
        });

        let right = document.createElement('button');
        right.innerHTML = '&rarr;';
        right.style.width = '15vw';
        right.style.height = '7vw';
        right.style.fontSize = '16px';
        right.style.userSelect = 'none';

        right.addEventListener('touchstart', (ev) => {
            this.right = true;
            ev.preventDefault();
        });
        right.addEventListener('mousedown', (ev) => {
            this.right = true;
            ev.preventDefault();
        });

        right.addEventListener('touchend', (ev) => {
            this.right = false;
            ev.preventDefault();
        });
        right.addEventListener('mouseup', (ev) => {
            this.right = false;
            ev.preventDefault();
        });

        let thrust = document.createElement('button');
        thrust.innerHTML = '&#8593;';
        thrust.style.width = '15vw';
        thrust.style.height = '7vw';
        thrust.style.fontSize = '16px';
        thrust.style.userSelect = 'none';

        thrust.addEventListener('touchstart', (ev) => {
            this.up = true;
            ev.preventDefault();
        });
        thrust.addEventListener('mousedown', (ev) => {
            this.up = true;
            ev.preventDefault();
        });
        thrust.addEventListener('touchend', (ev) => {
            this.up = false;
            ev.preventDefault();
        });
        thrust.addEventListener('mouseup', (ev) => {
            this.up = false;
            ev.preventDefault();
        });

        let fire = document.createElement('button');
        fire.innerHTML = 'FIRE!';
        fire.style.width = '15vw';
        fire.style.height = '7vw';
        fire.style.fontSize = '16px';
        fire.style.userSelect = 'none';
        fire.style.marginLeft = 'auto';
        fire.addEventListener('touchstart', (ev) => {
            this.fire = true;
            ev.preventDefault();
        });
        fire.addEventListener('mousedown', (ev) => {
            this.fire = true;
            ev.preventDefault();
        });
        fire.addEventListener('touchend', (ev) => {
            this.fire = false;
            ev.preventDefault();
        });
        fire.addEventListener('mouseup', (ev) => {
            this.fire = false;
            ev.preventDefault();
        });


        this.controlsDiv.appendChild(left);
        this.controlsDiv.appendChild(right);

        this.controlsDiv.appendChild(fire);
        this.controlsDiv.appendChild(thrust);
    }

    constructor(game: Game) {
        super('asteroids', game);

        if (navigator.userAgent.toLowerCase().match(/mobile/i)) {
            this.makeHtmlControls();
            this.isMobile = true;
        }

        this.grid = new Grid(10, 10, game.ctx, 0, 0, 10000);
        this.grid.parallax = 0.25;
        this.geometries.push(this.grid);

        this.lowerCloudLayer = new CloudLayer(30, 0, 0, 10000);
        this.lowerCloudLayer.parallax = 0.5;
        this.geometries.push(this.lowerCloudLayer);

        this.cloudLayer = new CloudLayer(25, 0, 0, 10000);
        this.cloudLayer.parallax = 0.75;
        this.geometries.push(this.cloudLayer);

        this.geometries.push(new JDoubler(-100, -50, 15));

        this.ship = new Ship(0, 0, 40, this.game.ctx);
        this.geometries.push(this.ship);
        this.geometries.push(new Engine(this.ship, this.game.ctx));
        this.geometries.push(new Face(100, 0, 50));

        this.border = new Rectangle(0, 0, 10000);
        this.geometries.push(this.border);

        this.totalVaccinatedReadout = new Word('total vaccinated 0', 0, 0, 25, false, 0, '#00ffff');
        this.geometries.push(this.totalVaccinatedReadout);

        let storedTotal = localStorage.getItem('totalVaccinated');
        if (storedTotal) {
            this.totalVaccinated = parseInt(storedTotal, 10);
            this._lastTotalVaccinated = this.totalVaccinated;
        }

        this.title = new Word('asteroids zeneca', 0, 0, 25, false, 5, '#ffaaff');
        this.geometries.push(this.title);

        this.doublerAnnounce = new Word('j doubler activated', 0, 0, 30, false, undefined, 'yellow');
        this.doublerAnnounce.isVisible = false;
        this.geometries.push(this.doublerAnnounce);
    }

    addPuff(x: number, y: number, scale: number) {
        this.geometries.push(new Cloud(x, y, scale, Math.random() - 0.5, Math.random() - 0.5, (Math.random() - 0.5) / 100));
    }

    addVaccinated(x: number, y: number) {
        this.geometries.push(new VaccinatedFace(x - 100, y, 20));
    }

    private _updateInput(events: GameEvent[]) {
        Button.CheckEvents(events, this.buttons);
    
        for (let event of events) {
            if ((event.type == 'keydown' || event.type == 'keyup') && event.key) {
                switch (event.key) {
                    case 'Escape':
                        this.done = event.type == 'keydown';
                        break;
                    case 'a':
                    case 'ArrowLeft':
                        this.left = event.type == 'keydown';
                        break;
                    case 's':
                    case 'ArrowDown':
                        this.down = event.type == 'keydown';
                        break;
                    case 'w':
                    case 'ArrowUp':
                        this.up = event.type == 'keydown';
                        break;
                    case 'd':
                    case 'ArrowRight':
                        this.right = event.type == 'keydown';
                        break;
                    case ' ':
                        //if (event.type == 'keydown') this.isFiring = !this.isFiring;
                        this.fire = event.type == 'keydown';
                        break;
                }
            }
        }
    }

    private _updateShip(delta: number) {
        if ((this.isFiring || this.fire) && this.currentShotCooldown == 0) {
            this.geometries.push(new Bullet(this.ship, 40, this.game.ctx));
            this.currentShotCooldown = this.shotCooldown;
        }

        if (this.left) {
            this.ship.angle -= this.ship.rotationSpeed * delta;
        }

        if (this.right) {
            this.ship.angle += this.ship.rotationSpeed * delta;
        }

        this.currentShotCooldown -= delta * 4;
        if (this.currentShotCooldown < 0) this.currentShotCooldown = 0;

        this.ship.isEngineOn = this.up;
    }

    update(time: number, delta: number, events: GameEvent[]) {
        this._updateInput(events);

        this._updateShip(delta);

        if (this.done) {
            document.body.removeChild(this.controlsDiv);
            return;
        }

        this.geometries.forEach(g => g.update(delta, this));

        this.geometries.filter(g => g.adjustedHitbox && g instanceof Bullet).forEach((bullet) => {
            this.geometries.filter(g => g.adjustedHitbox && !(g instanceof Bullet)).every(item => {
                if (bullet.adjustedHitbox && item.adjustedHitbox && isColliding(bullet.adjustedHitbox, item.adjustedHitbox)) {
                    (bullet as Bullet).hit(item, this.ship.isDoubled);
                }
                return true;
            });
        });

        this.geometries.filter(g => g instanceof Face && (g as Face).isMouthOpen).forEach(face => {
            this.addPuff(face.x, face.y, face.scale / 3);
        });

        for (let g of this.geometries) {
            if (g.done) this.geometries.splice(this.geometries.indexOf(g), 1);
        }

        //if (Math.abs(this.ship.x) > this.game.width / 2 + 20) this.ship.x = -this.ship.x;
        //if (Math.abs(this.ship.y) > this.game.height / 2 + 20) this.ship.y = - this.ship.y;

        this.camera.x = this.ship.x;
        this.camera.y = this.ship.y;

        //this.grid.x = this.ship.x;
        //this.grid.y = this.ship.y;

        //this.lowerCloudLayer.x = this.ship.x - this.ship.x / 3 - this.cloudLayer.scale / 2;
        //this.lowerCloudLayer.y = this.ship.y - this.ship.y / 3 - this.cloudLayer.scale / 2;

        //this.cloudLayer.x = this.ship.x - this.ship.x / 2 - this.cloudLayer.scale / 2;
        //this.cloudLayer.y = this.ship.y - this.ship.y / 2 - this.cloudLayer.scale / 2;

        this.faceCount = this.geometries.filter(g => g instanceof Face).length;

        if (this.faceCount < 100) {
            for (let i = 0; i < 100 - this.faceCount; i++) {
                let x = Math.random() * 10000 - 5000;
                let y = Math.random() * 10000 - 5000;
                let newFace = new Face(x, y, Math.random() * 10 + 45);
                newFace.xVel = Math.random() * 10 - 5;
                newFace.yVel = Math.random() * 10 - 5;
                this.geometries.push(newFace);
            }
        }

        let jDoublerCount = 0;

        this.geometries.filter(g => g.adjustedHitbox && g instanceof JDoubler).forEach(g => {
            jDoublerCount++;
            if (g.adjustedHitbox && this.ship.adjustedHitbox && isColliding(g.adjustedHitbox, this.ship.adjustedHitbox)) {
                this.ship.isDoubled = true;
                this.ship.doublerTimer = 5;
                g.done = true;
            }
        });

        if (jDoublerCount < 10) {
            for (let i = 0; i < 10; i++) {
                this.geometries.push(new JDoubler(Math.random() * this.grid.scale - this.grid.scale / 2, Math.random() * this.grid.scale - this.grid.scale / 2, 15));
            }
        }

        this.geometries.filter(g => g instanceof Face || g instanceof Cloud).forEach(g => {
            if (Math.abs(this.ship.x - g.x) * this.overallScale < this.game.width / 2 + 100) {
                if (Math.abs(this.ship.y - g.y) * this.overallScale < this.game.height / 2 + 100) {
                    g.isVisible = true;
                    return;
                }
            }
            g.isVisible = false;

            if (Math.abs(g.x) > this.border.scale / 2) {
                g.xVel = -g.xVel / 2;
            }

            if (Math.abs(g.y) > this.border.scale / 2) {
                g.yVel = -g.yVel / 2;
            }
        });

        if (this.ship.x > this.border.scale / 2) {
            this.ship.xVel = -this.ship.xVel / 2;
            this.ship.x = this.border.scale / 2 - 20 * this.overallScale;
        } else if (this.ship.x < this.border.scale / -2) {
            this.ship.xVel = -this.ship.xVel / 2;
            this.ship.x = this.border.scale / -2 + 20 * this.overallScale;
        }

        if (this.ship.y > this.border.scale / 2) {
            this.ship.yVel = -this.ship.yVel / 2;
            this.ship.y = this.border.scale / 2 - 20 * this.overallScale;
        } else if (this.ship.y < this.border.scale / -2) {
            this.ship.yVel = -this.ship.yVel / 2;
            this.ship.y = this.border.scale / -2 + 20 * this.overallScale;
        }

        this.totalVaccinatedReadout.x = this.ship.x - this.game.width / 2 + 20 * this.overallScale;
        this.totalVaccinatedReadout.y = this.ship.y - this.game.height / 2 + 80 * this.overallScale;
        this.totalVaccinatedReadout.word = 'total vaccinated ' + this.totalVaccinated;

        if (this._lastTotalVaccinated !== this.totalVaccinated) {
            localStorage.setItem('totalVaccinated', this.totalVaccinated.toString());
            this._lastTotalVaccinated = this.totalVaccinated;
        }

        if (!this.title.done) {
            this.title.x = this.ship.x - this.title.width / 2, this.title.y = this.ship.y - 100 * this.overallScale;
        }

        if (this.ship.isDoubled) {
            this.doublerAnnounce.isVisible = true;
            this.doublerAnnounce.x = this.ship.x - this.doublerAnnounce.width / 2;
            this.doublerAnnounce.y = this.ship.y + this.game.height / 2 - 100;
        } else {
            this.doublerAnnounce.isVisible = false;
        }
    }

    draw() {
        let ctx = this.game.ctx;
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';

        ctx.fillStyle = 'black';
        ctx.fillRect(0, 0, this.game.width, this.game.height);

        this.geometries.filter(g => g.isVisible).forEach(g => g.draw(ctx, this.game.width, this.game.height, this.camera, this.overallScale));

        this.buttons.forEach(b => b.draw(this.game.ctx));
    }
}