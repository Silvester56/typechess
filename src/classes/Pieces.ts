import { Move } from './Move.js';

export enum Color { WHITE, BLACK };

const withinBounds = (x: number, y: number): boolean => {
  return (x >= 0 && y >= 0 && x <= 7 && y <= 7);
}

const seekPossibleMoves = (piece: Piece, seekerXCallback: Function, seekerYCallback: Function, otherPieces: Piece[], oneMove: boolean = false): Move[] => {
  let seekerX = piece.positionX;
  let seekerY = piece.positionY;
  let result = [];
  let encounteredPiece;
  let search = true;
  while (search) {
    search = !oneMove;
    seekerX = seekerXCallback(seekerX);
    seekerY = seekerYCallback(seekerY);
    if (withinBounds(seekerX, seekerY)) {
      encounteredPiece = otherPieces.find(p => p.positionX === seekerX && p.positionY === seekerY);
      if (encounteredPiece) {
        if (encounteredPiece.color === piece.color) {
          search = false;
        } else {
          result.push(new Move(piece.positionX, piece.positionY, seekerX, seekerY));
          search = false;
        }
      } else {
        result.push(new Move(piece.positionX, piece.positionY, seekerX, seekerY));
      }
    } else {
      search = false;
    }
  }
  return result;
}

export abstract class Piece {
  public positionX: number;
  public positionY: number;
  private spriteLoaded = false;
  abstract spriteXPosition: number;
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

  abstract possibleMoves(otherPieces: Piece[]): Move[];
}

export class King extends Piece {
  spriteXPosition = 0;

  constructor(x: number, y: number, color: Color) {
    super(x, y, color);
  }

  possibleMoves(otherPieces: Piece[]): Move[] {
    let result: Move[] = [];

    result = result.concat(seekPossibleMoves(this, (x: number) => x + 1, (x: number) => x + 1, otherPieces, true));
    result = result.concat(seekPossibleMoves(this, (x: number) => x + 1, (x: number) => x - 1, otherPieces, true));
    result = result.concat(seekPossibleMoves(this, (x: number) => x - 1, (x: number) => x + 1, otherPieces, true));
    result = result.concat(seekPossibleMoves(this, (x: number) => x - 1, (x: number) => x - 1, otherPieces, true));
    result = result.concat(seekPossibleMoves(this, (x: number) => x + 1, (x: number) => x, otherPieces, true));
    result = result.concat(seekPossibleMoves(this, (x: number) => x - 1, (x: number) => x, otherPieces, true));
    result = result.concat(seekPossibleMoves(this, (x: number) => x, (x: number) => x + 1, otherPieces, true));
    result = result.concat(seekPossibleMoves(this, (x: number) => x, (x: number) => x - 1, otherPieces, true));
    return result;
  }
}

export class Queen extends Piece {
  spriteXPosition = 45;

  constructor(x: number, y: number, color: Color) {
    super(x, y, color);
  }

  possibleMoves(otherPieces: Piece[]): Move[] {
    let result: Move[] = [];

    result = result.concat(seekPossibleMoves(this, (x: number) => x + 1, (x: number) => x + 1, otherPieces));
    result = result.concat(seekPossibleMoves(this, (x: number) => x + 1, (x: number) => x - 1, otherPieces));
    result = result.concat(seekPossibleMoves(this, (x: number) => x - 1, (x: number) => x + 1, otherPieces));
    result = result.concat(seekPossibleMoves(this, (x: number) => x - 1, (x: number) => x - 1, otherPieces));
    result = result.concat(seekPossibleMoves(this, (x: number) => x + 1, (x: number) => x, otherPieces));
    result = result.concat(seekPossibleMoves(this, (x: number) => x - 1, (x: number) => x, otherPieces));
    result = result.concat(seekPossibleMoves(this, (x: number) => x, (x: number) => x + 1, otherPieces));
    result = result.concat(seekPossibleMoves(this, (x: number) => x, (x: number) => x - 1, otherPieces));
    return result;
  }
}

export class Rook extends Piece {
  spriteXPosition = 180;

  constructor(x: number, y: number, color: Color) {
    super(x, y, color);
  }

  possibleMoves(otherPieces: Piece[]): Move[] {
    let result: Move[] = [];

    result = result.concat(seekPossibleMoves(this, (x: number) => x + 1, (x: number) => x, otherPieces));
    result = result.concat(seekPossibleMoves(this, (x: number) => x - 1, (x: number) => x, otherPieces));
    result = result.concat(seekPossibleMoves(this, (x: number) => x, (x: number) => x + 1, otherPieces));
    result = result.concat(seekPossibleMoves(this, (x: number) => x, (x: number) => x - 1, otherPieces));
    return result;
  }
}

export class Bishop extends Piece {
  spriteXPosition = 90;

  constructor(x: number, y: number, color: Color) {
    super(x, y, color);
  }

  possibleMoves(otherPieces: Piece[]): Move[] {
    let result: Move[] = [];

    result = result.concat(seekPossibleMoves(this, (x: number) => x + 1, (x: number) => x + 1, otherPieces));
    result = result.concat(seekPossibleMoves(this, (x: number) => x + 1, (x: number) => x - 1, otherPieces));
    result = result.concat(seekPossibleMoves(this, (x: number) => x - 1, (x: number) => x + 1, otherPieces));
    result = result.concat(seekPossibleMoves(this, (x: number) => x - 1, (x: number) => x - 1, otherPieces));
    return result;
  }
}

export class Knight extends Piece {
  spriteXPosition = 135;

  constructor(x: number, y: number, color: Color) {
    super(x, y, color);
  }

  possibleMoves(otherPieces: Piece[]): Move[] {
    let result: Move[] = [];

    result = result.concat(seekPossibleMoves(this, (x: number) => x + 2, (x: number) => x + 1, otherPieces, true));
    result = result.concat(seekPossibleMoves(this, (x: number) => x + 2, (x: number) => x - 1, otherPieces, true));
    result = result.concat(seekPossibleMoves(this, (x: number) => x - 2, (x: number) => x + 1, otherPieces, true));
    result = result.concat(seekPossibleMoves(this, (x: number) => x - 2, (x: number) => x - 1, otherPieces, true));
    result = result.concat(seekPossibleMoves(this, (x: number) => x + 1, (x: number) => x + 2, otherPieces, true));
    result = result.concat(seekPossibleMoves(this, (x: number) => x - 1, (x: number) => x + 2, otherPieces, true));
    result = result.concat(seekPossibleMoves(this, (x: number) => x + 1, (x: number) => x - 2, otherPieces, true));
    result = result.concat(seekPossibleMoves(this, (x: number) => x - 1, (x: number) => x - 2, otherPieces, true));
    return result;
  }
}

export class Pawn extends Piece {
  spriteXPosition = 225;
  public firstMove = true;

  constructor(x: number, y: number, color: Color) {
    super(x, y, color);
  }

  possibleMoves(otherPieces: Piece[]): Move[] {
    let result: Move[] = [];

    if (this.color === Color.WHITE) {
      result = result.concat(seekPossibleMoves(this, (x: number) => x, (x: number) => x - 1, otherPieces, true));
      if (this.firstMove) {
        result = result.concat(seekPossibleMoves(this, (x: number) => x, (x: number) => x - 2, otherPieces, true));
      }
    } else {
      result = result.concat(seekPossibleMoves(this, (x: number) => x, (x: number) => x + 1, otherPieces, true));
      if (this.firstMove) {
        result = result.concat(seekPossibleMoves(this, (x: number) => x, (x: number) => x + 2, otherPieces, true));
      }
    }
    return result;
  }
}