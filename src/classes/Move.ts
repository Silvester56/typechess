import { Piece } from "./Pieces";

export enum MoveType { NORMAL, SHORT_CASTLING, LONG_CASTLING, EN_PASSANT }

export class Move {
  readonly startX: number;
  readonly startY: number;
  readonly endX: number;
  readonly endY: number;
  readonly type: MoveType;
  readonly additionalPieceToMove: (Piece | undefined);

  constructor(sx: number, sy: number, ex: number, ey: number, t: MoveType = MoveType.NORMAL, additionalPiece?: (Piece | undefined)) {
    this.startX = sx;
    this.startY = sy;
    this.endX = ex;
    this.endY = ey;
    this.type = t;
    this.additionalPieceToMove = additionalPiece;
  }
}
