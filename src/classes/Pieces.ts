import { Move, MoveType } from './Move.js';

export enum Color { WHITE, BLACK };

enum UnallowedCaseWhileSeeking { EMPTY, ENEMY, UNDER_THREAT, NONE }

const withinBounds = (x: number, y: number): boolean => {
  return (x >= 0 && y >= 0 && x <= 7 && y <= 7);
}

export const isCaseUnderThreat = (x: number, y: number, allPieces: Piece[], allyColor: Color): boolean => {
  let moves: Move[] = [];

  moves = allPieces.filter(p => p.color !== allyColor && !(p instanceof King)).reduce((acc, cur) => acc.concat(cur.possibleMoves(allPieces)), moves);
  return moves.some(m => m.endX === x && m.endY === y);
}

export abstract class Piece {
  public positionX: number;
  public positionY: number;
  public firstMove = true;
  public enPassantTarget = false;
  private spriteLoaded = false;
  abstract spriteXPosition: number;
  abstract value: number;
  readonly color: Color;
  readonly sprite: any;

  constructor(x: number, y: number, color: Color) {
    this.positionX = x;
    this.positionY = y;
    this.color = color;
    this.sprite = new Image();
    this.sprite.src = "../assets/sprite.png";
    this.sprite.onload = () => {
      this.spriteLoaded = true;
    }
  }

  draw(ctx: any): void {
    if (this.spriteLoaded) {
      ctx.drawImage(this.sprite, this.spriteXPosition, this.color === Color.WHITE ? 0 : 45, 45, 45, this.positionX * 45, this.positionY * 45, 45, 45);
    }
  }

  seekPossibleMoves = (seekerXCallback: Function, seekerYCallback: Function, allPieces: Piece[], movesLimit: number = Infinity, unallowedCase: UnallowedCaseWhileSeeking = UnallowedCaseWhileSeeking.NONE): Move[] => {
    let seekerX = this.positionX;
    let seekerY = this.positionY;
    let result = [];
    let encounteredPiece;
    let search = true;
    while (search && movesLimit > 0) {
      movesLimit--;
      seekerX = seekerXCallback(seekerX);
      seekerY = seekerYCallback(seekerY);
      if (withinBounds(seekerX, seekerY)) {
        if (unallowedCase === UnallowedCaseWhileSeeking.UNDER_THREAT && isCaseUnderThreat(seekerX, seekerY, allPieces, this.color)) {
          return [];
        }
        encounteredPiece = allPieces.find(p => p.positionX === seekerX && p.positionY === seekerY);
        if (encounteredPiece) {
          if (encounteredPiece.color === this.color) {
            search = false;
          } else {
            if (unallowedCase !== UnallowedCaseWhileSeeking.ENEMY) {
              result.push(new Move(this.positionX, this.positionY, seekerX, seekerY));
            }
            search = false;
          }
        } else if (unallowedCase !== UnallowedCaseWhileSeeking.EMPTY) {
          result.push(new Move(this.positionX, this.positionY, seekerX, seekerY));
        }
      } else {
        search = false;
      }
    }
    return result;
  }

  isUnderThreat(allPieces: Piece[]): boolean {
    return isCaseUnderThreat(this.positionX, this.positionY, allPieces, this.color);
  }

  abstract possibleMoves(allPieces: Piece[]): Move[];
}

export class King extends Piece {
  spriteXPosition = 0;
  value = Infinity;

  constructor(x: number, y: number, color: Color) {
    super(x, y, color);
  }

  seekPossibleCastlingMoves(seekerXCallback: Function, allPieces: Piece[]) {
    let seekerX = this.positionX;
    let seekerY = this.positionY;
    let search = true;
    let result: Move[] = [];
    let encounteredPiece;

    while(search) {
      seekerX = seekerXCallback(seekerX);
      if (withinBounds(seekerX, seekerY)) {
        encounteredPiece = allPieces.find(p => p.positionX === seekerX && p.positionY === seekerY);
        if (Math.abs(this.positionX - seekerX) <= 2 && isCaseUnderThreat(seekerX, seekerY, allPieces, this.color)) {
          return [];
        }
        if (encounteredPiece) {
          if (encounteredPiece.color === this.color && encounteredPiece.firstMove && encounteredPiece instanceof Rook) {
            result.push(new Move(this.positionX, this.positionY, seekerX === 7 ? 6 : 2, seekerY, seekerX === 7 ? MoveType.SHORT_CASTLING : MoveType.LONG_CASTLING, encounteredPiece));
          } else {
            return [];
          }
        }
      } else {
        search = false;
      }
    }
    return result;
  }

  possibleMoves(allPieces: Piece[]): Move[] {
    let result: Move[] = [];

    if (this.firstMove && !this.isUnderThreat(allPieces)) {
      result = result.concat(this.seekPossibleCastlingMoves((x: number) => x + 1, allPieces));
      result = result.concat(this.seekPossibleCastlingMoves((x: number) => x - 1, allPieces));
    }
    result = result.concat(this.seekPossibleMoves((x: number) => x + 1, (x: number) => x + 1, allPieces, 1, UnallowedCaseWhileSeeking.UNDER_THREAT));
    result = result.concat(this.seekPossibleMoves((x: number) => x + 1, (x: number) => x - 1, allPieces, 1, UnallowedCaseWhileSeeking.UNDER_THREAT));
    result = result.concat(this.seekPossibleMoves((x: number) => x - 1, (x: number) => x + 1, allPieces, 1, UnallowedCaseWhileSeeking.UNDER_THREAT));
    result = result.concat(this.seekPossibleMoves((x: number) => x - 1, (x: number) => x - 1, allPieces, 1, UnallowedCaseWhileSeeking.UNDER_THREAT));
    result = result.concat(this.seekPossibleMoves((x: number) => x + 1, (x: number) => x, allPieces, 1, UnallowedCaseWhileSeeking.UNDER_THREAT));
    result = result.concat(this.seekPossibleMoves((x: number) => x - 1, (x: number) => x, allPieces, 1, UnallowedCaseWhileSeeking.UNDER_THREAT));
    result = result.concat(this.seekPossibleMoves((x: number) => x, (x: number) => x + 1, allPieces, 1, UnallowedCaseWhileSeeking.UNDER_THREAT));
    result = result.concat(this.seekPossibleMoves((x: number) => x, (x: number) => x - 1, allPieces, 1, UnallowedCaseWhileSeeking.UNDER_THREAT));
    return result;
  }
}

export class Queen extends Piece {
  spriteXPosition = 45;
  value = 9;

  constructor(x: number, y: number, color: Color) {
    super(x, y, color);
  }

  possibleMoves(allPieces: Piece[]): Move[] {
    let result: Move[] = [];

    result = result.concat(this.seekPossibleMoves((x: number) => x + 1, (x: number) => x + 1, allPieces));
    result = result.concat(this.seekPossibleMoves((x: number) => x + 1, (x: number) => x - 1, allPieces));
    result = result.concat(this.seekPossibleMoves((x: number) => x - 1, (x: number) => x + 1, allPieces));
    result = result.concat(this.seekPossibleMoves((x: number) => x - 1, (x: number) => x - 1, allPieces));
    result = result.concat(this.seekPossibleMoves((x: number) => x + 1, (x: number) => x, allPieces));
    result = result.concat(this.seekPossibleMoves((x: number) => x - 1, (x: number) => x, allPieces));
    result = result.concat(this.seekPossibleMoves((x: number) => x, (x: number) => x + 1, allPieces));
    result = result.concat(this.seekPossibleMoves((x: number) => x, (x: number) => x - 1, allPieces));
    return result;
  }
}

export class Rook extends Piece {
  spriteXPosition = 180;
  value = 5;

  constructor(x: number, y: number, color: Color) {
    super(x, y, color);
  }

  possibleMoves(allPieces: Piece[]): Move[] {
    let result: Move[] = [];

    result = result.concat(this.seekPossibleMoves((x: number) => x + 1, (x: number) => x, allPieces));
    result = result.concat(this.seekPossibleMoves((x: number) => x - 1, (x: number) => x, allPieces));
    result = result.concat(this.seekPossibleMoves((x: number) => x, (x: number) => x + 1, allPieces));
    result = result.concat(this.seekPossibleMoves((x: number) => x, (x: number) => x - 1, allPieces));
    return result;
  }
}

export class Bishop extends Piece {
  spriteXPosition = 90;
  value = 3;

  constructor(x: number, y: number, color: Color) {
    super(x, y, color);
  }

  possibleMoves(allPieces: Piece[]): Move[] {
    let result: Move[] = [];

    result = result.concat(this.seekPossibleMoves((x: number) => x + 1, (x: number) => x + 1, allPieces));
    result = result.concat(this.seekPossibleMoves((x: number) => x + 1, (x: number) => x - 1, allPieces));
    result = result.concat(this.seekPossibleMoves((x: number) => x - 1, (x: number) => x + 1, allPieces));
    result = result.concat(this.seekPossibleMoves((x: number) => x - 1, (x: number) => x - 1, allPieces));
    return result;
  }
}

export class Knight extends Piece {
  spriteXPosition = 135;
  value = 3;

  constructor(x: number, y: number, color: Color) {
    super(x, y, color);
  }

  possibleMoves(allPieces: Piece[]): Move[] {
    let result: Move[] = [];

    result = result.concat(this.seekPossibleMoves((x: number) => x + 2, (x: number) => x + 1, allPieces, 1));
    result = result.concat(this.seekPossibleMoves((x: number) => x + 2, (x: number) => x - 1, allPieces, 1));
    result = result.concat(this.seekPossibleMoves((x: number) => x - 2, (x: number) => x + 1, allPieces, 1));
    result = result.concat(this.seekPossibleMoves((x: number) => x - 2, (x: number) => x - 1, allPieces, 1));
    result = result.concat(this.seekPossibleMoves((x: number) => x + 1, (x: number) => x + 2, allPieces, 1));
    result = result.concat(this.seekPossibleMoves((x: number) => x - 1, (x: number) => x + 2, allPieces, 1));
    result = result.concat(this.seekPossibleMoves((x: number) => x + 1, (x: number) => x - 2, allPieces, 1));
    result = result.concat(this.seekPossibleMoves((x: number) => x - 1, (x: number) => x - 2, allPieces, 1));
    return result;
  }
}

export class Pawn extends Piece {
  spriteXPosition = 225;
  value = 1;

  constructor(x: number, y: number, color: Color) {
    super(x, y, color);
  }

  seekEnPassantMoves(seekerXOffset: number, allPieces: Piece[]) {
    let seekerX = this.positionX + seekerXOffset;
    let seekerY = this.positionY;
    let result: Move[] = [];
    let encounteredPiece;

    if (withinBounds(seekerX, seekerY)) {
      encounteredPiece = allPieces.find(p => p.positionX === seekerX && p.positionY === seekerY);
      if (encounteredPiece) {
        if (encounteredPiece.color !== this.color && encounteredPiece.enPassantTarget) {
          result.push(new Move(this.positionX, this.positionY, seekerX, seekerY + (this.color === Color.WHITE ? -1 : 1), MoveType.EN_PASSANT, encounteredPiece));
        }
      }
    }
    return result;
  }

  possibleMoves(allPieces: Piece[]): Move[] {
    let result: Move[] = [];
    let direction: number = this.color === Color.WHITE ? -1 : 1;

    result = result.concat(this.seekEnPassantMoves(-1, allPieces));
    result = result.concat(this.seekEnPassantMoves(1, allPieces));
    result = result.concat(this.seekPossibleMoves((x: number) => x - 1, (x: number) => x + direction, allPieces, 1, UnallowedCaseWhileSeeking.EMPTY));
    result = result.concat(this.seekPossibleMoves((x: number) => x + 1, (x: number) => x + direction, allPieces, 1, UnallowedCaseWhileSeeking.EMPTY));
    result = result.concat(this.seekPossibleMoves((x: number) => x, (x: number) => x + direction, allPieces, this.firstMove ? 2 : 1, UnallowedCaseWhileSeeking.ENEMY));
    return result;
  }
}