import { Case } from "./Case.js";
import { Move, MoveType } from "./Move.js";
import { Piece, Color, Rook, Knight, Bishop, Queen, King, Pawn, SeekerRestriction } from "./Pieces.js";
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

  constructor(startingPosition?: Case[][]) {
    if (startingPosition) {
      this.board = startingPosition;
    } else {
      this.board = Array.from(Array(8), (x, i) => Array.from(Array(8), (y, j) => new Case((i + j) % 2 === 0 ? Color.WHITE : Color.BLACK, returnPieceFromStartingPosition(i, j))));
    }
    this.caseDrawingSize = 45;
  }

  reset() {
    this.board = Array.from(Array(8), (x, i) => Array.from(Array(8), (y, j) => new Case((i + j) % 2 === 0 ? Color.WHITE : Color.BLACK, returnPieceFromStartingPosition(i, j))));
  }

  draw(ctx: any, addNumbers: boolean, checkToDraw: { positionX: number, positionY: number }) {
    this.board.forEach((line, i) => {
      line.forEach((square, j) => {
        square.draw(ctx, addNumbers, checkToDraw && i === checkToDraw.positionX && j === checkToDraw.positionY, i, j, this.caseDrawingSize);
      });
    });
  }

  withinBounds(x: number, y: number): boolean {
    return (x >= 0 && y >= 0 && x <= 7 && y <= 7);
  }

  getClone() {
    let boardClone = this.board.map(l => l.map(c => c.getClone()));

    return new Game(boardClone);
  }

  kingIsSafeAfterMove(playerColor: Color, move: Move) {
    let futureChessGame: Game = this.getClone();
    let kingIndex: number;

    futureChessGame.movePiece(move);
    kingIndex = futureChessGame.allPieces().findIndex(p => p.color === playerColor && p instanceof King);
    return !futureChessGame.allPieces()[kingIndex].isUnderThreat(futureChessGame);
  }

  possiblePieceMoves(startX: number, startY: number, piece: Piece): Move[] {
    let result: Move[] = [];

    if (piece.seekerCallbackList) {
      piece.seekerCallbackList.forEach(s => {
        result = result.concat(this.seekPossibleMoves(startX, startY, s.seekerCallbackX, s.seekerCallbackY, piece.seekerMovesLimit, s.restriction));
      });
    }

    return result;
  }

  possiblePlayerMoves(playerColor: Color): Move[] {
    let result: Move[] = [];

    this.board.forEach((line, i) => {
      line.forEach((square, j) => {
        if (square.eventualPiece && square.eventualPiece.color === playerColor) {
          result = result.concat(this.possiblePieceMoves(i, j, square.eventualPiece));
        }
      });
    });
    return result.filter(m => this.kingIsSafeAfterMove(playerColor, m));
  }

  seekPossibleMoves(startX: number, startY: number, seekerXCallback: Function, seekerYCallback: Function, seekerMovesLimit: number, restriction: SeekerRestriction = SeekerRestriction.NONE): Move[] {
    let seekerX = startX;
    let seekerY = startY;
    let result: Move[] = [];
    let piece = this.board[startX][startY].eventualPiece;
    let encounteredPiece;
    let search = true;

    if (restriction === SeekerRestriction.MUST_CAPTURE_EN_PASSANT && piece?.color === Color.BLACK && piece instanceof Pawn) {
      console.log(4);
    }

    while (piece && search && seekerMovesLimit > 0) {
      seekerMovesLimit--;
      seekerX = seekerXCallback(seekerX);
      seekerY = seekerYCallback(seekerY);
      if (this.withinBounds(seekerX, seekerY)) {
        encounteredPiece = this.board[seekerX][seekerY].eventualPiece;
        if (restriction === SeekerRestriction.MUST_CASTLE) {
          seekerMovesLimit = Infinity;
          if (piece.firstMove && !piece.isUnderThreat(this)) {
            if (Math.abs(startX - seekerX) <= 2 && this.isCaseUnderThreat(seekerX, seekerY, piece.color)) {
              return [];
            }
            if (encounteredPiece) {
              if (encounteredPiece.color === piece.color && encounteredPiece.firstMove && encounteredPiece instanceof Rook) {
                return [new Move(startX, startY, seekerX === 7 ? 6 : 2, seekerY, seekerX === 7 ? MoveType.SHORT_CASTLING : MoveType.LONG_CASTLING, encounteredPiece)];
              } else {
                return [];
              }
            }
          }
        } else {
          if (encounteredPiece) {
            if (encounteredPiece.color === piece.color) {
              search = false;
            } else {
              if (restriction !== SeekerRestriction.CANNOT_CAPTURE) {
                if (restriction === SeekerRestriction.MUST_CAPTURE_EN_PASSANT) {
                  if (encounteredPiece.enPassantTarget) {
                    result.push(new Move(startX, startY, seekerX, seekerY + (piece.color === Color.WHITE ? -1 : 1), MoveType.EN_PASSANT, encounteredPiece));
                  }
                } else {
                  result.push(new Move(startX, startY, seekerX, seekerY));
                }
              }
              search = false;
            }
          } else if (restriction !== SeekerRestriction.MUST_CAPTURE && restriction !== SeekerRestriction.MUST_CAPTURE_EN_PASSANT) {
            result.push(new Move(startX, startY, seekerX, seekerY));
          }
        }
      } else {
        search = false;
      }
    }
    return result;
  }

  getRingMovesWithoutRestrictions(positionX: number, positionY: number): Move[] {
    return [
      new Move(positionX, positionY, positionX + 1, positionY + 1),
      new Move(positionX, positionY, positionX + 1, positionY),
      new Move(positionX, positionY, positionX + 1, positionY - 1),
      new Move(positionX, positionY, positionX, positionY + 1),
      new Move(positionX, positionY, positionX, positionY - 1),
      new Move(positionX, positionY, positionX - 1, positionY + 1),
      new Move(positionX, positionY, positionX - 1, positionY),
      new Move(positionX, positionY, positionX - 1, positionY - 1)];
  }

  isCaseUnderThreat(x: number, y: number, allyColor: Color): boolean {
    let moves: Move[] = [];

    let enemyKing = this.allPieces().find(p => p.color !== allyColor && p instanceof King);
    if (enemyKing) {
      moves = this.getRingMovesWithoutRestrictions(enemyKing.positionX, enemyKing.positionY).concat(this.allPieces().filter(p => p.color !== allyColor && !(p instanceof King)).reduce((acc, cur) => acc.concat(this.possiblePieceMoves(cur.positionX, cur.positionY, cur)), moves));
    }
    return moves.some(m => m.endX === x && m.endY === y);
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
        moveEndingCase.eventualPiece.seekerMovesLimit = 1;
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
