import { Color, Piece } from "./Pieces.js";
import { Move, MoveType } from "./Move.js";

export class Strategy {
    private materialCoefficient: number;
    private positionCoefficient: number;
    private randomCoefficient: number;
    private castlingValue: number;
    readonly pieceToPromoteIndex: number;
  
    constructor(mc: number, pc: number, rc: number, cv: number, pt: number) {
      this.materialCoefficient = mc;
      this.positionCoefficient = pc;
      this.randomCoefficient = rc;
      this.castlingValue = cv;
      this.pieceToPromoteIndex = pt;
    }

    getMoveValue(allPieces: Piece[], move: Move, playerColor: Color): number {
        let enemyPieceValue = allPieces.find(p => p.positionX === move.endX && p.positionY === move.endY)?.value || 0;
        let distanceToEnd = playerColor === Color.WHITE ? move.endY : (7 - move.endY);

        if (move.type === MoveType.SHORT_CASTLING || move.type === MoveType.LONG_CASTLING) {
            return this.castlingValue;
        }
        return (this. materialCoefficient * enemyPieceValue) - (this.positionCoefficient * distanceToEnd) + (this.randomCoefficient * Math.random());
    }
  }
  