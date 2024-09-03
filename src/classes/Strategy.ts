import { Bishop, Color, isCaseUnderThreat, Knight, Pawn, Piece, Queen, Rook } from "./Pieces.js";
import { Move, MoveType } from "./Move.js";

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

    getMoveValue(allPieces: Piece[], move: Move, playerColor: Color, lastMove: Move | undefined, numberOfPreviousMoves: number): number {
        let enemyPieceValue = allPieces.find(p => p.positionX === move.endX && p.positionY === move.endY)?.value || 0;
        let distanceToEnd = playerColor === Color.WHITE ? move.startY : (7 - move.startY);
        let allyPieceIndex = allPieces.findIndex(p => p.positionX === move.startX && p.positionY === move.startY);
        let base = 0;

        if (lastMove && lastMove.startX === move.endX && lastMove.startY === move.endY && lastMove.endX === move.startX && lastMove.endY === move.startY) {
          return -Infinity;
        }
        if (move.type === MoveType.SHORT_CASTLING || move.type === MoveType.LONG_CASTLING) {
            return this.castlingValue;
        }
        if (numberOfPreviousMoves < 4 && getOpeningMoves(playerColor).includes(move)) {
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
        if (isCaseUnderThreat(move.startX, move.startY, allPieces, playerColor)) {
          base = base + this.runAwayCoefficient * allPieces[allyPieceIndex].value;
        }
        if (isCaseUnderThreat(move.endX, move.endY, allPieces, playerColor)) {
          base = base - this.riskAversionCoefficient * allPieces[allyPieceIndex].value;
        }
        return base + this. capturingCoefficient * enemyPieceValue;
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
  