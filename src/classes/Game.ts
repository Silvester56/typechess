export class Game {
  private board: boolean[][]; // true : white, false : black

  constructor() {
    this.board = Array.from(Array(8), (x, i) => Array.from(Array(8), (y, j) => (i + j) % 2 === 0));
  }
}
