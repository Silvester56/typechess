import { Bishop, Color, King, Knight, Pawn, Piece, Queen, Rook } from "./Pieces.js";
import { Move, MoveType } from "./Move.js";
import { Game } from "./Game.js";

const modifyParameter = (x: number) => {
  let signs = [-1, 1];

  return x + signs[Math.floor(Math.random() * 2)] * Math.random();
};

const getOpeningMoves = (color: Color): Move[] => {
  let result: Move[] = [];

  if (color === Color.WHITE) {
    result.push(new Move(3,6,3,4));
    result.push(new Move(3,6,3,5));
    result.push(new Move(4,6,4,4));
    result.push(new Move(4,6,4,5));
    result.push(new Move(1,7,2,5));
    result.push(new Move(6,7,5,5));
  } else {
    result.push(new Move(3,1,3,3));
    result.push(new Move(3,1,3,2));
    result.push(new Move(4,1,4,4));
    result.push(new Move(4,1,4,2));
    result.push(new Move(1,0,2,2));
    result.push(new Move(6,0,5,2));
  }
  return result;
};

const canMoveCreateACheck = (chessGame: Game, move: Move, color: Color): boolean => {
  let futurePieces: Piece[] = chessGame.allPieces().map(p => Object.assign(Object.create(Object.getPrototypeOf(p)), p));
  let allyPieceIndex: number = futurePieces.findIndex(p => p.positionX === move.startX && p.positionY === move.startY);
  let enemyPieceIndex: number = futurePieces.findIndex(p => p.positionX === move.endX && p.positionY === move.endY);
  let enemyKingIndex: number;

  futurePieces[allyPieceIndex].positionX = move.endX;
  futurePieces[allyPieceIndex].positionY = move.endY;
  if (enemyPieceIndex > -1) {
    futurePieces.splice(enemyPieceIndex, 1);
  }
  enemyKingIndex = futurePieces.findIndex(p => p.color !== color && p instanceof King);
  return futurePieces[enemyKingIndex].isUnderThreat(chessGame);
}

export class Strategy {
    private capturingCoefficient: number;
    private runAwayCoefficient: number;
    private riskAversionCoefficient: number;
    private castlingValue: number;
    readonly pieceToPromoteIndex: number;
  
    constructor(capCoeff: number, runCoeff: number, riskCoeff: number, castValue: number, pieceProm: number) {
      this.capturingCoefficient = capCoeff;
      this.runAwayCoefficient = runCoeff;
      this.riskAversionCoefficient = riskCoeff;
      this.castlingValue = castValue;
      this.pieceToPromoteIndex = pieceProm;
    }

    toString(): string {
      return `${this.capturingCoefficient} ${this.runAwayCoefficient} ${this.riskAversionCoefficient} ${this.castlingValue}`;
    }

    getMoveValue(chessGame: Game, move: Move, playerColor: Color, lastMove: Move | undefined, numberOfPreviousMoves: number): number {
        let allPieces = chessGame.allPieces();
        let enemyPieceValue = allPieces.find(p => p.positionX === move.endX && p.positionY === move.endY)?.value || 0;
        let distanceToEnd = playerColor === Color.WHITE ? move.startY : (7 - move.startY);
        let allyPieceIndex = allPieces.findIndex(p => p.positionX === move.startX && p.positionY === move.startY);
        let base = 0;

        if (lastMove && lastMove.startX === move.endX && lastMove.startY === move.endY && lastMove.endX === move.startX && lastMove.endY === move.startY) {
          base = -5;
        }
        if (move.type === MoveType.SHORT_CASTLING || move.type === MoveType.LONG_CASTLING) {
            return this.castlingValue;
        }
        if (numberOfPreviousMoves < 4 && getOpeningMoves(playerColor).findIndex(m => m.startX === move.startX && m.endX === move.endX && m.startY === move.startY && m.endY === move.endY) > -1) {
          return 5 + Math.random();
        }
        if (allPieces[allyPieceIndex] instanceof Pawn) {
          base = (move.startX > 5 || move.startX < 2) ? 0 : 3;
        } else if (allPieces[allyPieceIndex] instanceof Rook) {
          base = 0;
        } else if (allPieces[allyPieceIndex] instanceof Bishop) {
          base = 2;
        } else if (allPieces[allyPieceIndex] instanceof Knight) {
          base = distanceToEnd === 7 ? 3 : 1;
        } else if (allPieces[allyPieceIndex] instanceof Queen) {
          base = 1;
        }
        if (chessGame.isCaseUnderThreat(move.startX, move.startY, playerColor)) {
          base = base + this.runAwayCoefficient * allPieces[allyPieceIndex].value;
        }
        if (chessGame.isCaseUnderThreat(move.endX, move.endY, playerColor)) {
          base = base - this.riskAversionCoefficient * allPieces[allyPieceIndex].value;
        }
        if (canMoveCreateACheck(chessGame, move, playerColor)) {
          base = base + 8;
        }
        return base + this.capturingCoefficient * enemyPieceValue;
    }

    reproduce(): Strategy {
      return new Strategy(
        modifyParameter(this.capturingCoefficient),
        modifyParameter(this.runAwayCoefficient),
        modifyParameter(this.riskAversionCoefficient),
        modifyParameter(this.castlingValue),
        this.pieceToPromoteIndex);
    }
  }
  