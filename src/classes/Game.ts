export class Game {
  private board: boolean[][]; // true : white, false : black

  constructor() {
    this.board = Array.from(Array(8), (x, i) => Array.from(Array(8), (y, j) => (i + j) % 2 === 0));
  }

  draw (ctx: any, addNumbers: boolean, checkToDraw: {positionX: number, positionY: number}) {
    this.board.forEach((line, i) => {
      line.forEach((square, j) => {
        ctx.fillStyle = square ? "#f2e1c3" : "#c3a082";
        if (checkToDraw && i === checkToDraw.positionX && j === checkToDraw.positionY) {
          ctx.fillStyle = "#aa2222";
        }
        ctx.fillRect(i * 45, j * 45, 45, 45);
        if (addNumbers) {
          ctx.fillStyle = square ? "#c3a082" : "#f2e1c3";
          ctx.fillText(`${i}, ${j}`, i * 45 + 10, j * 45 + 10);
        }
      });
    });
  }
}
