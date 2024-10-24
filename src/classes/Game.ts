import { Case } from "./Case.js";
import { Move, MoveType } from "./Move.js";
import { Piece, Color, Rook, Knight, Bishop, Queen, King, Pawn } from "./Pieces.js";
import { Player } from "./Player.js";

const returnPieceFromStartingPosition = (x: number, y: number): (Piece | null) => {
  let color = y < 4 ? Color.BLACK : Color.WHITE;

  if (y === 0 || y === 7) {
    if (x === 0 || x === 7) {
      return new Rook(x, y, color);
    } else if (x === 1 || x === 6) {
      return new Knight(x, y, color);
    } else if (x === 2 || x === 5) {
      return new Bishop(x, y, color);
    } else if (x === 3) {
      return new Queen(x, y, color);
    } else {
      return new King(x, y, color);
    }
  } else if (y === 1 || y === 6) {
    return new Pawn(x, y, color);
  }
  return null;
};

export class Game {
  private board: Case[][];
  private caseDrawingSize: number;

  constructor() {
    this.board = Array.from(Array(8), (x, i) => Array.from(Array(8), (y, j) => new Case((i + j) % 2 === 0 ? Color.WHITE : Color.BLACK, returnPieceFromStartingPosition(i, j))));
    this.caseDrawingSize = 45;
  }

  reset() {
    this.board = Array.from(Array(8), (x, i) => Array.from(Array(8), (y, j) => new Case((i + j) % 2 === 0 ? Color.WHITE : Color.BLACK, returnPieceFromStartingPosition(i, j))));
  }

  draw (ctx: any, addNumbers: boolean, checkToDraw: {positionX: number, positionY: number}) {
    this.board.forEach((line, i) => {
      line.forEach((square, j) => {
        square.draw(ctx, addNumbers, checkToDraw && i === checkToDraw.positionX && j === checkToDraw.positionY, i, j, this.caseDrawingSize);
      });
    });
  }

  movePiece(move: Move, player?: Player) {
    let moveEndingCase = this.board[move.endX][move.endY];

    for (let index = 0; index < this.allPieces().length; index++) {
      this.allPieces()[index].enPassantTarget = false;
    }
    moveEndingCase.eventualPiece = this.board[move.startX][move.startY].eventualPiece;
    this.board[move.startX][move.startY].eventualPiece = null;
    if (moveEndingCase.eventualPiece) {
      moveEndingCase.eventualPiece.firstMove = false;
      moveEndingCase.eventualPiece.positionX = move.endX;
      moveEndingCase.eventualPiece.positionY = move.endY;
      if (moveEndingCase.eventualPiece instanceof Pawn) {
        if (move.range() === 2) {
          moveEndingCase.eventualPiece.enPassantTarget = true;
        }
        if (player) {
          if ((moveEndingCase.eventualPiece.color === Color.WHITE && moveEndingCase.eventualPiece.positionY === 0) || (moveEndingCase.eventualPiece.color === Color.BLACK && moveEndingCase.eventualPiece.positionY === 7)) {
            moveEndingCase.eventualPiece = player.promote(moveEndingCase.eventualPiece.positionX, moveEndingCase.eventualPiece.positionY);
          }
        }
      }
    }
    if (move.additionalPiece) {
      if (move.type === MoveType.EN_PASSANT) {
        this.board[move.additionalPiece.positionX][move.additionalPiece.positionY].eventualPiece = null;
      }
      if (move.type === MoveType.SHORT_CASTLING) {
        this.movePiece(new Move(move.additionalPiece.positionX, move.additionalPiece.positionY, 5, move.additionalPiece.positionY));
      }
      if (move.type === MoveType.LONG_CASTLING) {
        this.movePiece(new Move(move.additionalPiece.positionX, move.additionalPiece.positionY, 3, move.additionalPiece.positionY));
      }
    }
  }

  allPieces() {
    let result: Piece[] = [];

    return this.board.flat().reduce((acc, cur) => cur.eventualPiece ? acc.concat([cur.eventualPiece]) : acc, result);
  }
}
