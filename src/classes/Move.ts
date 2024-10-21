import { Piece } from "./Pieces";

export enum MoveType { NORMAL, SHORT_CASTLING, LONG_CASTLING, EN_PASSANT }

const positionToString = (x: number, y: number): string => {
  return "abcdefgh".split("")[x] + "87654321".split("")[y];
}

export class Move {
  readonly startX: number;
  readonly startY: number;
  readonly endX: number;
  readonly endY: number;
  readonly type: MoveType;
  readonly additionalPiece: (Piece | undefined);

  constructor(sx: number, sy: number, ex: number, ey: number, t: MoveType = MoveType.NORMAL, ap?: Piece) {
    this.startX = sx;
    this.startY = sy;
    this.endX = ex;
    this.endY = ey;
    this.type = t;
    this.additionalPiece = ap;
  }

  range(): number {
    return Math.sqrt((this.startX - this.endX) * (this.startX - this.endX) + (this.startY - this.endY) * (this.startY - this.endY))
  }

  toString(): string {
    let result = positionToString(this.startX, this.startY) + "-" + positionToString(this.endX, this.endY);

    switch (this.type) {
      case MoveType.SHORT_CASTLING:
        result = result + " short castle";
        break;
      case MoveType.LONG_CASTLING:
        result = result + " long castle";
        break;
      case MoveType.EN_PASSANT:
        result = result + " en passant...";
        break;    
      default:
        break;
    }
    return result;
  }

  draw (ctx: any) {
    ctx.fillStyle = "#999999";
    ctx.fillRect(this.endX * 45 + 11, this.endY * 45 + 11, 22, 22);
  }
}
