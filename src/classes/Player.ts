import { Color, Piece } from './Pieces.js';
import { Move } from './Move.js';

export class Player {
  private color: Color;

  constructor(c: Color) {
    this.color = c;
  }

  play(allPieces: Piece[], moveCallback: Function): boolean {
    let moves: Move[] = [];
    moves = allPieces.filter(p => p.color === this.color).reduce((acc, cur) => acc.concat(cur.possibleMoves(allPieces)), moves);

    if (moves.length > 0) {
      moveCallback(moves[Math.floor(Math.random() * moves.length)]);
      return true;
    }
    return false;
  }
}
