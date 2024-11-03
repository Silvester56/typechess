import { Game } from './Game.js';
import { Move, MoveType } from './Move.js';

export enum Color { WHITE, BLACK };

export enum UnallowedCaseWhileSeeking { EMPTY, ENEMY, NONE }

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

  isUnderThreat(chessGame: Game): boolean {
    return chessGame.isCaseUnderThreat(this.positionX, this.positionY, this.color);
  }

  abstract possibleMoves(chessGame: Game): Move[];
}

export class King extends Piece {
  spriteXPosition = 0;
  value = Infinity;

  constructor(x: number, y: number, color: Color) {
    super(x, y, color);
  }

  possibleMoves(chessGame: Game): Move[] {
    let result: Move[] = [];

    if (this.firstMove && !this.isUnderThreat(chessGame)) {
      result = result.concat(chessGame.seekPossibleCastlingMoves(this.positionX, this.positionY, (x: number) => x + 1));
      result = result.concat(chessGame.seekPossibleCastlingMoves(this.positionX, this.positionY, (x: number) => x - 1));
    }
    result = result.concat(chessGame.seekPossibleNormalMoves(this.positionX, this.positionY, (x: number) => x + 1, (x: number) => x + 1, 1));
    result = result.concat(chessGame.seekPossibleNormalMoves(this.positionX, this.positionY, (x: number) => x + 1, (x: number) => x - 1, 1));
    result = result.concat(chessGame.seekPossibleNormalMoves(this.positionX, this.positionY, (x: number) => x - 1, (x: number) => x + 1, 1));
    result = result.concat(chessGame.seekPossibleNormalMoves(this.positionX, this.positionY, (x: number) => x - 1, (x: number) => x - 1, 1));
    result = result.concat(chessGame.seekPossibleNormalMoves(this.positionX, this.positionY, (x: number) => x + 1, (x: number) => x, 1));
    result = result.concat(chessGame.seekPossibleNormalMoves(this.positionX, this.positionY, (x: number) => x - 1, (x: number) => x, 1));
    result = result.concat(chessGame.seekPossibleNormalMoves(this.positionX, this.positionY, (x: number) => x, (x: number) => x + 1, 1));
    result = result.concat(chessGame.seekPossibleNormalMoves(this.positionX, this.positionY, (x: number) => x, (x: number) => x - 1, 1));
    return result;
  }
}

export class Queen extends Piece {
  spriteXPosition = 45;
  value = 9;

  constructor(x: number, y: number, color: Color) {
    super(x, y, color);
  }

  possibleMoves(chessGame: Game): Move[] {
    let result: Move[] = [];

    result = result.concat(chessGame.seekPossibleNormalMoves(this.positionX, this.positionY, (x: number) => x + 1, (x: number) => x + 1));
    result = result.concat(chessGame.seekPossibleNormalMoves(this.positionX, this.positionY, (x: number) => x + 1, (x: number) => x - 1));
    result = result.concat(chessGame.seekPossibleNormalMoves(this.positionX, this.positionY, (x: number) => x - 1, (x: number) => x + 1));
    result = result.concat(chessGame.seekPossibleNormalMoves(this.positionX, this.positionY, (x: number) => x - 1, (x: number) => x - 1));
    result = result.concat(chessGame.seekPossibleNormalMoves(this.positionX, this.positionY, (x: number) => x + 1, (x: number) => x));
    result = result.concat(chessGame.seekPossibleNormalMoves(this.positionX, this.positionY, (x: number) => x - 1, (x: number) => x));
    result = result.concat(chessGame.seekPossibleNormalMoves(this.positionX, this.positionY, (x: number) => x, (x: number) => x + 1));
    result = result.concat(chessGame.seekPossibleNormalMoves(this.positionX, this.positionY, (x: number) => x, (x: number) => x - 1));
    return result;
  }
}

export class Rook extends Piece {
  spriteXPosition = 180;
  value = 5;

  constructor(x: number, y: number, color: Color) {
    super(x, y, color);
  }

  possibleMoves(chessGame: Game): Move[] {
    let result: Move[] = [];

    result = result.concat(chessGame.seekPossibleNormalMoves(this.positionX, this.positionY, (x: number) => x + 1, (x: number) => x));
    result = result.concat(chessGame.seekPossibleNormalMoves(this.positionX, this.positionY, (x: number) => x - 1, (x: number) => x));
    result = result.concat(chessGame.seekPossibleNormalMoves(this.positionX, this.positionY, (x: number) => x, (x: number) => x + 1));
    result = result.concat(chessGame.seekPossibleNormalMoves(this.positionX, this.positionY, (x: number) => x, (x: number) => x - 1));
    return result;
  }
}

export class Bishop extends Piece {
  spriteXPosition = 90;
  value = 3;

  constructor(x: number, y: number, color: Color) {
    super(x, y, color);
  }

  possibleMoves(chessGame: Game): Move[] {
    let result: Move[] = [];

    result = result.concat(chessGame.seekPossibleNormalMoves(this.positionX, this.positionY, (x: number) => x + 1, (x: number) => x + 1));
    result = result.concat(chessGame.seekPossibleNormalMoves(this.positionX, this.positionY, (x: number) => x + 1, (x: number) => x - 1));
    result = result.concat(chessGame.seekPossibleNormalMoves(this.positionX, this.positionY, (x: number) => x - 1, (x: number) => x + 1));
    result = result.concat(chessGame.seekPossibleNormalMoves(this.positionX, this.positionY, (x: number) => x - 1, (x: number) => x - 1));
    return result;
  }
}

export class Knight extends Piece {
  spriteXPosition = 135;
  value = 3;

  constructor(x: number, y: number, color: Color) {
    super(x, y, color);
  }

  possibleMoves(chessGame: Game): Move[] {
    let result: Move[] = [];

    result = result.concat(chessGame.seekPossibleNormalMoves(this.positionX, this.positionY, (x: number) => x + 2, (x: number) => x + 1, 1));
    result = result.concat(chessGame.seekPossibleNormalMoves(this.positionX, this.positionY, (x: number) => x + 2, (x: number) => x - 1, 1));
    result = result.concat(chessGame.seekPossibleNormalMoves(this.positionX, this.positionY, (x: number) => x - 2, (x: number) => x + 1, 1));
    result = result.concat(chessGame.seekPossibleNormalMoves(this.positionX, this.positionY, (x: number) => x - 2, (x: number) => x - 1, 1));
    result = result.concat(chessGame.seekPossibleNormalMoves(this.positionX, this.positionY, (x: number) => x + 1, (x: number) => x + 2, 1));
    result = result.concat(chessGame.seekPossibleNormalMoves(this.positionX, this.positionY, (x: number) => x - 1, (x: number) => x + 2, 1));
    result = result.concat(chessGame.seekPossibleNormalMoves(this.positionX, this.positionY, (x: number) => x + 1, (x: number) => x - 2, 1));
    result = result.concat(chessGame.seekPossibleNormalMoves(this.positionX, this.positionY, (x: number) => x - 1, (x: number) => x - 2, 1));
    return result;
  }
}

export class Pawn extends Piece {
  spriteXPosition = 225;
  value = 1;

  constructor(x: number, y: number, color: Color) {
    super(x, y, color);
  }

  possibleMoves(chessGame: Game): Move[] {
    let result: Move[] = [];
    let direction: number = this.color === Color.WHITE ? -1 : 1;

    result = result.concat(chessGame.seekPossibleEnPassantMoves(this.positionX, this.positionY, -1));
    result = result.concat(chessGame.seekPossibleEnPassantMoves(this.positionX, this.positionY, 1));
    result = result.concat(chessGame.seekPossibleNormalMoves(this.positionX, this.positionY, (x: number) => x - 1, (x: number) => x + direction, 1, UnallowedCaseWhileSeeking.EMPTY));
    result = result.concat(chessGame.seekPossibleNormalMoves(this.positionX, this.positionY, (x: number) => x + 1, (x: number) => x + direction, 1, UnallowedCaseWhileSeeking.EMPTY));
    result = result.concat(chessGame.seekPossibleNormalMoves(this.positionX, this.positionY, (x: number) => x, (x: number) => x + direction, this.firstMove ? 2 : 1, UnallowedCaseWhileSeeking.ENEMY));
    return result;
  }
}