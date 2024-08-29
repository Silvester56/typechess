import { Color, Piece, King, Queen, Rook, Bishop, Knight, Pawn } from './Pieces.js';
import { Move, MoveType } from './Move.js';

export enum Strategy { RANDOM, MATERIAL_FIRST, CENTER_FIRST, HYBRID, HYBRID_CASTLE_EARLY }

export class Player {
  private color: Color;
  private strategy: Strategy;
  private hasCastle: boolean = false;

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
      if (this.strategy === Strategy.RANDOM) {
        return this.movePiece(allPieces, moves[Math.floor(Math.random() * moves.length)]);
      }
      moves.sort((a, b) => this.getMoveValue(allPieces, b) - this.getMoveValue(allPieces, a));
      return this.movePiece(allPieces, moves[0]);
    }
    console.log(this.color === Color.WHITE ? "White" : "Black", " can't play");
    return false;
  }

  getMoveValue(allPieces: Piece[], move: Move): number {
    let allyPiece = allPieces.find(p => p.positionX === move.startX && p.positionY === move.startY);
    let enemyPieceValue = allPieces.find(p => p.positionX === move.endX && p.positionY === move.endY)?.value || 0;
    let distanceToCenter = Math.sqrt((move.endX - 3.5) * (move.endX - 3.5) + (move.endY - 3.5) * (move.endY - 3.5));
    let result = 0;

    if (move.type === MoveType.SHORT_CASTLING || move.type === MoveType.LONG_CASTLING) {
      return Infinity;      
    }
    if (this.strategy === Strategy.MATERIAL_FIRST) {
      return enemyPieceValue;
    } else if (this.strategy === Strategy.CENTER_FIRST) {
      if ((move.startX === 3 || move.startX === 4) && (move.startY === 3 || move.startY === 4)) {
        return -Infinity;
      }
      return -distanceToCenter;
    } else if (this.strategy === Strategy.HYBRID) {
      return enemyPieceValue - distanceToCenter;
    } else if (this.strategy === Strategy.HYBRID_CASTLE_EARLY && allyPiece) {
      if (this.hasCastle) {
        return enemyPieceValue - distanceToCenter;
      }
      if (allyPiece instanceof Rook) {
        return -Infinity;
      }
      if (allyPiece instanceof King) {
        return -Infinity;
      }
      result = allyPiece?.value;
      if (allyPiece.firstMove) {
        result = result + 10;
      }
      result = result - Math.abs(allyPiece.positionX - 3.5);
    }
    return result;
  }

  movePiece(allPieces: Piece[], move: Move): boolean {
    let allyPieceIndex = allPieces.findIndex(p => p.positionX === move.startX && p.positionY === move.startY);
    let enemyPieceIndex = allPieces.findIndex(p => p.positionX === move.endX && p.positionY === move.endY);
    let keepOnPlaying = false;
  
    if (allPieces[allyPieceIndex]) {
      allPieces[allyPieceIndex].positionX = move.endX;
      allPieces[allyPieceIndex].positionY = move.endY;
      allPieces[allyPieceIndex].firstMove = false;
      if (move.type === MoveType.SHORT_CASTLING) {
        if (move.additionalPieceToMove) {
          move.additionalPieceToMove.positionX = 5;
        }
        this.hasCastle = true;
        console.log(this.color === Color.WHITE ? "White" : "Black", " short castle");
      }
      if (move.type === MoveType.LONG_CASTLING) {
        if (move.additionalPieceToMove) {
          move.additionalPieceToMove.positionX = 3;
        }
        this.hasCastle = true;
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

    if (this.strategy === Strategy.RANDOM) {
      return possiblePieces[Math.floor(Math.random() * possiblePieces.length)];
    }
    return possiblePieces[0];
  }
}
