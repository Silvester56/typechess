import { Color, Piece } from './Pieces.js';
import { Move } from './Move.js';

export enum Strategy { RANDOM, MATERIAL_FIRST }

const getMoveValue = (allPieces: Piece[], move: Move): number => {
  return allPieces.find(p => p.positionX === move.endX && p.positionY === move.endY)?.value || 0;
}

export class Player {
  private color: Color;
  private strategy: Strategy;

  constructor(c: Color, s: Strategy) {
    this.color = c;
    this.strategy = s;
  }

  play(allPieces: Piece[], moveCallback: Function): boolean {
    let moves: Move[] = [];
    moves = allPieces.filter(p => p.color === this.color).reduce((acc, cur) => acc.concat(cur.possibleMoves(allPieces)), moves);

    if (moves.length > 0) {
      if (this.strategy === Strategy.RANDOM) {
        moveCallback(moves[Math.floor(Math.random() * moves.length)]);
      } else if (this.strategy === Strategy.MATERIAL_FIRST) {
        moves.sort((a, b) => getMoveValue(allPieces, b) - getMoveValue(allPieces, a));
        moveCallback(moves[0]);
      }
      return true;
    }
    return false;
  }
}
