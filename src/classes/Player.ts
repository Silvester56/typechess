import { Color, Piece, King, Queen, Rook, Bishop, Knight, Pawn } from './Pieces.js';
import { Move, MoveType } from './Move.js';
import { Strategy } from './Strategy.js';

export enum GameState { PLAY, WHITE_WIN, BLACK_WIN, DRAW, OUT_OF_TURNS };

export abstract class Player {
  readonly color: Color;

  constructor(c: Color) {
    this.color = c;
  }

  abstract play(allPieces: Piece[], canvas: any): Promise<GameState>;

  movePiece(allPieces: Piece[], move: Move): GameState {
    let allyPieceIndex = allPieces.findIndex(p => p.positionX === move.startX && p.positionY === move.startY);
    let enemyPieceIndex = allPieces.findIndex(p => p.positionX === move.endX && p.positionY === move.endY);
    let lastEnPassantTargetPieceIndex = allPieces.findIndex(p => p.enPassantTarget);
    let gameState = GameState.PLAY;
  
    if (allPieces[allyPieceIndex]) {
      if (lastEnPassantTargetPieceIndex > -1) {
        allPieces[lastEnPassantTargetPieceIndex].enPassantTarget = false;
      }
      allPieces[allyPieceIndex].positionX = move.endX;
      allPieces[allyPieceIndex].positionY = move.endY;
      allPieces[allyPieceIndex].firstMove = false;
      if (allPieces[allyPieceIndex] instanceof Pawn) {
        if (move.range() === 2) {
          allPieces[allyPieceIndex].enPassantTarget = true;
        }
      }
      if (move.type === MoveType.EN_PASSANT) {
        enemyPieceIndex = lastEnPassantTargetPieceIndex;
      }
      if (move.type === MoveType.SHORT_CASTLING) {
        if (move.additionalPieceToMove) {
          move.additionalPieceToMove.positionX = 5;
        }
      }
      if (move.type === MoveType.LONG_CASTLING) {
        if (move.additionalPieceToMove) {
          move.additionalPieceToMove.positionX = 3;
        }
      }
      if (allPieces[allyPieceIndex] instanceof Pawn) {
        if ((allPieces[allyPieceIndex].color === Color.WHITE && allPieces[allyPieceIndex].positionY === 0) || (allPieces[allyPieceIndex].color === Color.BLACK && allPieces[allyPieceIndex].positionY === 7)) {
          allPieces[allyPieceIndex] = this.promote(allPieces[allyPieceIndex].positionX, allPieces[allyPieceIndex].positionY);
        }
      }
      if (enemyPieceIndex > -1) {
        if (allPieces[enemyPieceIndex] instanceof King) {
          gameState = this.color === Color.WHITE ? GameState.WHITE_WIN : GameState.BLACK_WIN;
        }
        allPieces.splice(enemyPieceIndex, 1);
      }
    } else {
      console.log(this.color === Color.WHITE ? "White" : "Black", " doesn't have a piece at that position");
    }
    return gameState;
  }

  abstract promote(x: number, y: number): Piece;
}

export class Bot extends Player {
  public strategy: Strategy;
  public score = {winningScore: 0, materialScore: 0};
  private lastMove: Move | undefined;
  private playingDelay: number;
  private indexOfMoves: number;

  constructor(c: Color, s: Strategy, p: number) {
    super(c);
    this.strategy = s;
    this.lastMove = undefined;
    this.playingDelay = p;
    this.indexOfMoves = 0;
  }

  play(allPieces: Piece[]): Promise<GameState> {
    return new Promise(resolve => {
      setTimeout(() => {
        let possibleMoves: Move[] = [];
        let isPlayable = (p: Piece) => p.color === this.color;
    
        if (allPieces.find(p => p.color === this.color && p instanceof King)?.isUnderThreat(allPieces)) {
          isPlayable = (p: Piece) => p.color === this.color && p instanceof King;
        }
        possibleMoves = allPieces.filter(p => isPlayable(p)).reduce((acc, cur) => acc.concat(cur.possibleMoves(allPieces)), possibleMoves);
    
        if (possibleMoves.length > 0) {
          possibleMoves.sort((a, b) => this.strategy.getMoveValue(allPieces, b, this.color, this.lastMove, this.indexOfMoves) - this.strategy.getMoveValue(allPieces, a, this.color, this.lastMove, this.indexOfMoves));
          this.lastMove = possibleMoves[0];
          this.indexOfMoves++;
          resolve(this.movePiece(allPieces, possibleMoves[0]));
        } else {
          resolve(GameState.DRAW);
        }
      }, this.playingDelay);
    });
  }

  promote(x: number, y: number): Piece {
    let possiblePieces = [new Queen(x, y, this.color), new Rook(x, y, this.color), new Bishop(x, y, this.color), new Knight(x, y, this.color)];

    return possiblePieces[this.strategy.pieceToPromoteIndex];
  }

  getScore(allPieces: Piece[], gameState: GameState): {winningScore: number, materialScore: number} {
    let material = allPieces.filter(p => p.color === this.color && p.value !== Infinity).reduce((acc, cur) => acc + cur.value, 0);
    let game = 0.5;

    if (gameState === GameState.WHITE_WIN) {
      game = this.color === Color.WHITE ? 1 : 0;
    } else if (gameState === GameState.BLACK_WIN) {
      game = this.color === Color.BLACK ? 1 : 0;
    }
    return {winningScore: game, materialScore: material};
  }

  reproduce(): Bot {
    return new Bot(this.color, this.strategy.reproduce(), this.playingDelay);
  }
}

export class Human extends Player {
  private positionArray: {positionX: number, positionY: number}[];
  private eventListenerForCanvas: Function;

  constructor(c: Color) {
    super(c);
    this.positionArray = [];
    this.eventListenerForCanvas = () => null;
  }

  play(allPieces: Piece[], canvas: any): Promise<GameState> {
    return new Promise(resolve => {
      let possibleMoves: Move[] = [];
      let isPlayable = (p: Piece) => p.color === this.color;
      let indexOfMove: number = 0;
  
      if (allPieces.find(p => p.color === this.color && p instanceof King)?.isUnderThreat(allPieces)) {
        isPlayable = (p: Piece) => p.color === this.color && p instanceof King;
      }
      possibleMoves = allPieces.filter(p => isPlayable(p)).reduce((acc, cur) => acc.concat(cur.possibleMoves(allPieces)), possibleMoves);
      if (possibleMoves.length > 0) {
        this.eventListenerForCanvas = (event: any) => {
          const rect = canvas.getBoundingClientRect()
          const x = event.clientX - rect.left;
          const y = event.clientY - rect.top;
          this.positionArray.push({positionX: Math.floor(x / 45), positionY: Math.floor(y / 45)});
          if (this.positionArray.length === 2) {
            indexOfMove = possibleMoves.findIndex(m => m.startX === this.positionArray[0].positionX && m.startY === this.positionArray[0].positionY && m.endX === this.positionArray[1].positionX && m.endY === this.positionArray[1].positionY);
            if (indexOfMove > -1) {
              resolve(this.movePiece(allPieces, possibleMoves[indexOfMove]));
              canvas.removeEventListener('mousedown', this.eventListenerForCanvas);
            }
            this.positionArray = [];
          }
        };
        canvas.addEventListener('mousedown', this.eventListenerForCanvas);
      } else {
        resolve(GameState.DRAW);
      }
    });
  }

  promote(x: number, y: number): Piece {
    let possiblePieces = [new Queen(x, y, this.color), new Rook(x, y, this.color), new Bishop(x, y, this.color), new Knight(x, y, this.color)];

    return possiblePieces[0];
  }
}
