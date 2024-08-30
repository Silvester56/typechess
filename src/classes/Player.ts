import { Color, Piece, King, Queen, Rook, Bishop, Knight, Pawn } from './Pieces.js';
import { Move, MoveType } from './Move.js';
import { Strategy } from './Strategy.js';

export class Player {
  private color: Color;
  private strategy: Strategy;

  constructor(c: Color, s: Strategy) {
    this.color = c;
    this.strategy = s;
  }

  play(allPieces: Piece[]): boolean {
    let moves: Move[] = [];
    let isPlayable = (p: Piece) => p.color === this.color;

    if (allPieces.find(p => p.color === this.color && p instanceof King)?.isUnderThreat(allPieces)) {
      isPlayable = (p: Piece) => p.color === this.color && p instanceof King;
    }
    moves = allPieces.filter(p => isPlayable(p)).reduce((acc, cur) => acc.concat(cur.possibleMoves(allPieces)), moves);

    if (moves.length > 0) {
      moves.sort((a, b) => this.strategy.getMoveValue(allPieces, b) - this.strategy.getMoveValue(allPieces, a));
      return this.movePiece(allPieces, moves[0]);
    }
    console.log(this.color === Color.WHITE ? "White" : "Black", " can't play");
    return false;
  }

  movePiece(allPieces: Piece[], move: Move): boolean {
    let allyPieceIndex = allPieces.findIndex(p => p.positionX === move.startX && p.positionY === move.startY);
    let enemyPieceIndex = allPieces.findIndex(p => p.positionX === move.endX && p.positionY === move.endY);
    let lastEnPassantTargetPieceIndex = allPieces.findIndex(p => p.enPassantTarget);
    let keepOnPlaying = false;
  
    if (allPieces[allyPieceIndex]) {
      if (lastEnPassantTargetPieceIndex > -1) {
        allPieces[lastEnPassantTargetPieceIndex].enPassantTarget = false;
      }
      allPieces[allyPieceIndex].positionX = move.endX;
      allPieces[allyPieceIndex].positionY = move.endY;
      allPieces[allyPieceIndex].firstMove = false;
      if (allPieces[allyPieceIndex] instanceof Pawn) {
        if (move.range() === 2) {
          allPieces[allyPieceIndex].enPassantTarget = true;
        }
      }
      if (move.type === MoveType.EN_PASSANT) {
        enemyPieceIndex = lastEnPassantTargetPieceIndex;
        console.log("En passant...");
      }
      if (move.type === MoveType.SHORT_CASTLING) {
        if (move.additionalPieceToMove) {
          move.additionalPieceToMove.positionX = 5;
        }
        console.log(this.color === Color.WHITE ? "White" : "Black", " short castle");
      }
      if (move.type === MoveType.LONG_CASTLING) {
        if (move.additionalPieceToMove) {
          move.additionalPieceToMove.positionX = 3;
        }
        console.log(this.color === Color.WHITE ? "White" : "Black", " long castle");
      }
      if ((allPieces[allyPieceIndex].color === Color.WHITE && allPieces[allyPieceIndex].positionY === 0) || (allPieces[allyPieceIndex].color === Color.BLACK && allPieces[allyPieceIndex].positionY === 7) && allPieces[allyPieceIndex] instanceof Pawn) {
        allPieces[allyPieceIndex] = this.promote(allPieces[allyPieceIndex].positionX, allPieces[allyPieceIndex].positionY);
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

    return possiblePieces[this.strategy.pieceToPromoteIndex];
  }
}
