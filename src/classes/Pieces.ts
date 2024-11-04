import { Game } from './Game.js';

export enum Color { WHITE, BLACK };

export enum SeekerRestriction { MUST_CAPTURE, CANNOT_CAPTURE, MUST_CAPTURE_EN_PASSANT, MUST_CASTLE, NONE }

export abstract class Piece {
  public positionX: number;
  public positionY: number;
  public firstMove = true;
  public enPassantTarget = false;
  private spriteLoaded = false;
  abstract spriteXPosition: number;
  abstract value: number;
  public seekerCallbackList: {seekerCallbackX: (x: number) => number, seekerCallbackY: (y: number) => number, restriction?: SeekerRestriction}[] = [];
  public seekerMovesLimit: number = Infinity;
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
}

export class King extends Piece {
  spriteXPosition = 0;
  value = Infinity;

  constructor(x: number, y: number, color: Color) {
    super(x, y, color);
    this.seekerCallbackList = [{
      seekerCallbackX: x => x + 1,
      seekerCallbackY: y => y,
    },{
      seekerCallbackX: x => x - 1,
      seekerCallbackY: y => y,
    },{
      seekerCallbackX: x => x,
      seekerCallbackY: y => y + 1,
    },{
      seekerCallbackX: x => x,
      seekerCallbackY: y => y - 1,
    },{
      seekerCallbackX: x => x + 1,
      seekerCallbackY: y => y + 1,
    },{
      seekerCallbackX: x => x - 1,
      seekerCallbackY: y => y + 1,
    },{
      seekerCallbackX: x => x + 1,
      seekerCallbackY: y => y - 1,
    },{
      seekerCallbackX: x => x - 1,
      seekerCallbackY: y => y - 1,
    },{
      seekerCallbackX: x => x + 1,
      seekerCallbackY: y => y,
      restriction: SeekerRestriction.MUST_CASTLE
    },{
      seekerCallbackX: x => x - 1,
      seekerCallbackY: y => y,
      restriction: SeekerRestriction.MUST_CASTLE
    }];
    this.seekerMovesLimit = 1;
  }
}

export class Queen extends Piece {
  spriteXPosition = 45;
  value = 9;

  constructor(x: number, y: number, color: Color) {
    super(x, y, color);
    this.seekerCallbackList = [{
      seekerCallbackX: x => x + 1,
      seekerCallbackY: y => y,
    },{
      seekerCallbackX: x => x - 1,
      seekerCallbackY: y => y,
    },{
      seekerCallbackX: x => x,
      seekerCallbackY: y => y + 1,
    },{
      seekerCallbackX: x => x,
      seekerCallbackY: y => y - 1,
    },{
      seekerCallbackX: x => x + 1,
      seekerCallbackY: y => y + 1,
    },{
      seekerCallbackX: x => x - 1,
      seekerCallbackY: y => y + 1,
    },{
      seekerCallbackX: x => x + 1,
      seekerCallbackY: y => y - 1,
    },{
      seekerCallbackX: x => x - 1,
      seekerCallbackY: y => y - 1,
    }];
  }
}

export class Rook extends Piece {
  spriteXPosition = 180;
  value = 5;

  constructor(x: number, y: number, color: Color) {
    super(x, y, color);
    this.seekerCallbackList = [{
      seekerCallbackX: x => x + 1,
      seekerCallbackY: y => y,
    },{
      seekerCallbackX: x => x - 1,
      seekerCallbackY: y => y,
    },{
      seekerCallbackX: x => x,
      seekerCallbackY: y => y + 1,
    },{
      seekerCallbackX: x => x,
      seekerCallbackY: y => y - 1,
    }];
  }
}

export class Bishop extends Piece {
  spriteXPosition = 90;
  value = 3;

  constructor(x: number, y: number, color: Color) {
    super(x, y, color);
    this.seekerCallbackList = [{
      seekerCallbackX: x => x + 1,
      seekerCallbackY: y => y + 1,
    },{
      seekerCallbackX: x => x - 1,
      seekerCallbackY: y => y + 1,
    },{
      seekerCallbackX: x => x + 1,
      seekerCallbackY: y => y - 1,
    },{
      seekerCallbackX: x => x - 1,
      seekerCallbackY: y => y - 1,
    }];
  }
}

export class Knight extends Piece {
  spriteXPosition = 135;
  value = 3;

  constructor(x: number, y: number, color: Color) {
    super(x, y, color);
    this.seekerCallbackList = [{
      seekerCallbackX: x => x + 2,
      seekerCallbackY: y => y + 1,
    },{
      seekerCallbackX: x => x - 2,
      seekerCallbackY: y => y + 1,
    },{
      seekerCallbackX: x => x + 2,
      seekerCallbackY: y => y - 1,
    },{
      seekerCallbackX: x => x - 2,
      seekerCallbackY: y => y - 1,
    },{
      seekerCallbackX: x => x + 1,
      seekerCallbackY: y => y + 2,
    },{
      seekerCallbackX: x => x - 1,
      seekerCallbackY: y => y + 2,
    },{
      seekerCallbackX: x => x + 1,
      seekerCallbackY: y => y - 2,
    },{
      seekerCallbackX: x => x - 1,
      seekerCallbackY: y => y - 2,
    }];
    this.seekerMovesLimit = 1;
  }
}

export class Pawn extends Piece {
  spriteXPosition = 225;
  value = 1;

  constructor(x: number, y: number, color: Color) {
    super(x, y, color);
    let direction: number = this.color === Color.WHITE ? -1 : 1;

    this.seekerCallbackList = [{
      seekerCallbackX: x => x,
      seekerCallbackY: y => y + direction,
      restriction: SeekerRestriction.CANNOT_CAPTURE
    },{
      seekerCallbackX: x => x - 1,
      seekerCallbackY: y => y + direction,
      restriction: SeekerRestriction.MUST_CAPTURE
    },{
      seekerCallbackX: x => x + 1,
      seekerCallbackY: y => y + direction,
      restriction: SeekerRestriction.MUST_CAPTURE
    },{
      seekerCallbackX: x => x - 1,
      seekerCallbackY: y => y,
      restriction: SeekerRestriction.MUST_CAPTURE_EN_PASSANT
    },{
      seekerCallbackX: x => x + 1,
      seekerCallbackY: y => y,
      restriction: SeekerRestriction.MUST_CAPTURE_EN_PASSANT
    }];
    this.seekerMovesLimit = 2;
  }
}