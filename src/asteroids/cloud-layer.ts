import { Geometry } from "./geometry.js";

export class CloudLayer extends Geometry {
    constructor(cloudCount: number, x: number, y: number, scale: number) {
        super(x, y,scale);
        this.isMirrored = false;
        for (let i = 0; i < cloudCount; i++) {
            let cloudX = Math.random();
            let cloudY = Math.random();
            let cloudWidth = Math.random() * 0.1;
            let cloudHeight = Math.random() * 0.1;
            this.points.push({
                action:'m', 
                x: cloudX,
                y: cloudY
            });
            this.points.push({
                action: 'l', 
                x: cloudX + cloudWidth,
                y: cloudY
            });
            this.points.push({
                action: 'l',
                x: cloudX + cloudWidth,
                y: cloudY + cloudHeight
            });
            this.points.push({
                action: 'l',
                x: cloudX,
                y: cloudY + cloudHeight
            });
            this.points.push({
                action: 'l',
                x: cloudX,
                y: cloudY
            });
        }

        // the cloud are generated in a 1x1 area starting at 0,0.  Subtract 0.5 from each x and y to shift the whole layer up and left by 50% so it is centered on the games 0,0 origin.
        this.points.forEach(p => {
            p.x -= 0.5;
            p.y -= 0.5;
        })

        this.strokeStyle = '#333333';
        this.fillStyle = '#333333';
        this.isFilled = true;
    }
}