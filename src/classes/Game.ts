import { Case } from "./Case.js";
import { Piece, Color, Rook, Knight, Bishop, Queen, King, Pawn } from "./Pieces.js";

const returnPieceFromStartingPosition = (x: number, y: number): Piece => {
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
  }
  return new Pawn(x, y, color);
};

export class Game {
  private board: Case[][];
  private caseDrawingSize: number;
  public allPieces: Piece[];

  constructor() {
    this.board = Array.from(Array(8), (x, i) => Array.from(Array(8), (y, j) => new Case((i + j) % 2 === 0 ? Color.WHITE : Color.BLACK)));
    this.caseDrawingSize = 45;
    this.allPieces = Array.from(Array(32), (_, number) => returnPieceFromStartingPosition(number % 8, number < 16 ? Math.floor(number / 8) : 4 + Math.floor(number / 8)));
  }

  reset() {
    this.allPieces = Array.from(Array(32), (_, number) => returnPieceFromStartingPosition(number % 8, number < 16 ? Math.floor(number / 8) : 4 + Math.floor(number / 8)));
  }

  draw (ctx: any, addNumbers: boolean, checkToDraw: {positionX: number, positionY: number}) {
    this.board.forEach((line, i) => {
      line.forEach((square, j) => {
        square.draw(ctx, addNumbers, checkToDraw && i === checkToDraw.positionX && j === checkToDraw.positionY, i, j, this.caseDrawingSize);
      });
    });
    this.allPieces.forEach(piece => piece.draw(ctx));
  }
}
