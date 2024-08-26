export class Game {
  private board: boolean[][]; // true : white, false : black

  constructor() {
    this.board = Array.from(Array(8), (x, i) => Array.from(Array(8), (y, j) => (i + j) % 2 === 0));
  }

  draw (ctx: any) {
    this.board.forEach((line, i) => {
      line.forEach((square, j) => {
        ctx.fillStyle = square ? "#f2e1c3" : "#c3a082";
        ctx.fillRect(i * 30, j * 30, 30, 30);
      });
    });
  }
}
