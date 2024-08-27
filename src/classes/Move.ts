export class Move {
    private startX: number;
    private startY: number;
    private endX: number;
    private endY: number;

    constructor(sx: number, sy: number, ex: number, ey: number) {
        this.startX = sx;
        this.startY = sy;
        this.endX = ex;
        this.endY = ey;
    }
}
