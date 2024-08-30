import { Piece } from "./Pieces.js";
import { Move, MoveType } from "./Move.js";

export class Strategy {
    private materialCoefficient: number;
    private centerCoefficient: number;
    private randomCoefficient: number;
    private castlingValue: number;
    readonly pieceToPromoteIndex: number;
  
    constructor(mc: number, cc: number, rc: number, cv: number, pt: number) {
      this.materialCoefficient = mc;
      this.centerCoefficient = cc;
      this.randomCoefficient = rc;
      this.castlingValue = cv;
      this.pieceToPromoteIndex = pt;
    }

    getMoveValue(allPieces: Piece[], move: Move): number {
        let enemyPieceValue = allPieces.find(p => p.positionX === move.endX && p.positionY === move.endY)?.value || 0;
        let distanceToCenter = Math.sqrt((move.endX - 3.5) * (move.endX - 3.5) + (move.endY - 3.5) * (move.endY - 3.5));

        if (move.type === MoveType.SHORT_CASTLING || move.type === MoveType.LONG_CASTLING) {
            return this.castlingValue;
        }
        return (this. materialCoefficient * enemyPieceValue) - (this.centerCoefficient * distanceToCenter) + (this.randomCoefficient * Math.random());
    }
  }
  