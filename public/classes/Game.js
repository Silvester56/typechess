export class Game {
    constructor() {
        this.board = Array.from(Array(8), (x, i) => Array.from(Array(8), (y, j) => (i + j) % 2 === 0));
    }
}
