import { Color, Piece, King, Queen, Rook, Bishop, Knight, Pawn } from './Pieces.js';
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

  play(allPieces: Piece[]): boolean {
    let moves: Move[] = [];
    moves = allPieces.filter(p => p.color === this.color).reduce((acc, cur) => acc.concat(cur.possibleMoves(allPieces)), moves);

    if (moves.length > 0) {
      if (this.strategy === Strategy.RANDOM) {
        return this.movePiece(allPieces, moves[Math.floor(Math.random() * moves.length)]);
      } else if (this.strategy === Strategy.MATERIAL_FIRST) {
        moves.sort((a, b) => getMoveValue(allPieces, b) - getMoveValue(allPieces, a));
        return this.movePiece(allPieces, moves[0]);
      }
    }
    console.log(this.color === Color.WHITE ? "White" : "Black", " can't play");
    return false;
  }

  movePiece(allPieces: Piece[], move: Move): boolean {
    let allyPieceIndex = allPieces.findIndex(p => p.positionX === move.startX && p.positionY === move.startY);
    let enemyPieceIndex = allPieces.findIndex(p => p.positionX === move.endX && p.positionY === move.endY);
    let keepOnPlaying = false;
  
    if (allPieces[allyPieceIndex]) {
      allPieces[allyPieceIndex].positionX = move.endX;
      allPieces[allyPieceIndex].positionY = move.endY;
      if (allPieces[allyPieceIndex] instanceof Pawn) {
        allPieces[allyPieceIndex].firstMove = false;
        if ((allPieces[allyPieceIndex].color === Color.WHITE && allPieces[allyPieceIndex].positionY === 0) || (allPieces[allyPieceIndex].color === Color.BLACK && allPieces[allyPieceIndex].positionY === 7)) {
          allPieces[allyPieceIndex] = this.promote(allPieces[allyPieceIndex].positionX, allPieces[allyPieceIndex].positionY);
        }
      }
      keepOnPlaying =  true;
      if (enemyPieceIndex > -1) {
        if (allPieces[enemyPieceIndex] instanceof King) {
          console.log(this.color === Color.WHITE ? "White" : "Black", " WON !!!");
          keepOnPlaying =  false;
        }
        allPieces.splice(enemyPieceIndex, 1);
      }
    } else {
      console.log(this.color === Color.WHITE ? "White" : "Black", " doesn't have a piece at that position");
    }
    return keepOnPlaying;
  }

  promote(x: number, y: number): Piece {
    let possiblePieces = [new Queen(x, y, this.color), new Rook(x, y, this.color), new Bishop(x, y, this.color), new Knight(x, y, this.color)];

    if (this.strategy === Strategy.RANDOM) {
      return possiblePieces[Math.floor(Math.random() * possiblePieces.length)];
    }
    return possiblePieces[0];
  }
}
