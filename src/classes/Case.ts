import { Color } from "./Pieces.js";

export class Case {
  private color: Color;

  constructor(c: Color) {
    this.color = c;
  }

  draw(ctx: any, addNumbers: boolean, checked: boolean, positionX: number, positionY: number, size: number) {
    ctx.fillStyle = this.color === Color.WHITE ? "#f2e1c3" : "#c3a082";
    if (checked) {
      ctx.fillStyle = "#aa2222";
    }
    ctx.fillRect(positionX * size, positionY * size, size, size);
    if (addNumbers) {
      ctx.fillStyle = this.color === Color.WHITE ? "#c3a082" : "#f2e1c3";
      ctx.fillText(`${positionX}, ${positionY}`, positionX * size + 10, positionY * size + 10);
    }
  }
}