export class Move {
  readonly startX: number;
  readonly startY: number;
  readonly endX: number;
  readonly endY: number;

  constructor(sx: number, sy: number, ex: number, ey: number) {
    this.startX = sx;
    this.startY = sy;
    this.endX = ex;
    this.endY = ey;
  }
}
