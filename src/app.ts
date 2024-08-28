import { Game } from './classes/Game.js';
import { Move } from './classes/Move.js';
import { Player } from './classes/Player.js';
import { Color, Piece, King, Queen, Rook, Bishop, Knight, Pawn } from './classes/Pieces.js';

const canvas: any = document.querySelector('#canvas');
const canvasContext = canvas.getContext('2d');

const chessGame = new Game();
let allPieces: Piece[];
let whitePlayer = new Player(Color.WHITE);
let blackPlayer = new Player(Color.BLACK);
let weHaveAWinner = false;

const returnPieceFromStartingPosition = (x: number, y: number) => {
  if (y === 1) {
    return new Pawn(x, y, Color.BLACK);
  } else if (y === 6) {
    return new Pawn(x, y, Color.WHITE);
  } else if (x === 0 || x === 7) {
    return new Rook(x, y, y === 0 ? Color.BLACK : Color.WHITE);
  } else if (x === 1 || x === 6) {
    return new Knight(x, y, y === 0 ? Color.BLACK : Color.WHITE);
  } else if (x === 2 || x === 5) {
    return new Bishop(x, y, y === 0 ? Color.BLACK : Color.WHITE);
  } else if (x === 3) {
    return new Queen(x, y, y === 0 ? Color.BLACK : Color.WHITE);
  } else {
    return new King(x, y, y === 0 ? Color.BLACK : Color.WHITE);
  }
};

allPieces = Array.from(Array(32), (_, number) => returnPieceFromStartingPosition(number % 8, number < 16 ? Math.floor(number / 8) : 4 + Math.floor(number / 8)));

const movePiece = (move: Move): void => {
  let allyPieceIndex = allPieces.findIndex(p => p.positionX === move.startX && p.positionY === move.startY);
  let enemyPieceIndex = allPieces.findIndex(p => p.positionX === move.endX && p.positionY === move.endY);

  if (allPieces[allyPieceIndex]) {
    allPieces[allyPieceIndex].positionX = move.endX;
    allPieces[allyPieceIndex].positionY = move.endY;
    if (allPieces[allyPieceIndex] instanceof Pawn) {
      allPieces[allyPieceIndex].firstMove = false;
      if ((allPieces[allyPieceIndex].color === Color.WHITE && allPieces[allyPieceIndex].positionY === 0) || (allPieces[allyPieceIndex].color === Color.BLACK && allPieces[allyPieceIndex].positionY === 7)) {
        allPieces[allyPieceIndex] = new Queen(allPieces[allyPieceIndex].positionX, allPieces[allyPieceIndex].positionY, allPieces[allyPieceIndex].color);
      }
    }
    if (enemyPieceIndex > -1) {
      if (allPieces[enemyPieceIndex] instanceof King) {
        console.log(allPieces[allyPieceIndex].color === Color.WHITE ? "White" : "Black", " WON !!!");
        weHaveAWinner = true;
      }
      allPieces.splice(enemyPieceIndex, 1);
    }
  }
};

async function playerDelay(p: Player, delay: number): Promise<boolean> {
  return new Promise(resolve => {
    setTimeout(() => resolve(p.play(allPieces, movePiece)), delay);
  });
}

let button = document.querySelector('#start');

async function startGame() {
  let whiteCanPlay = true;
  let blackCanPlay = true;
  
  while (whiteCanPlay && blackCanPlay && !weHaveAWinner) {
    whiteCanPlay = await playerDelay(whitePlayer, 500);
    if (!weHaveAWinner) {
      blackCanPlay = await playerDelay(blackPlayer, 500);
    }
  }
  if (!whiteCanPlay) {
    console.log("White can't play");
  }
  if (!blackCanPlay) {
    console.log("Black can't play");
  }
}

if (button) {
  button.addEventListener("click", () => {
    button.setAttribute("disabled", "true");
    startGame();
  });
}

const animationLoop = () => {
  requestAnimationFrame(animationLoop);
  canvasContext.clearRect(0, 0, 500, 500);
  chessGame.draw(canvasContext);
  allPieces.forEach(piece => piece.draw(canvasContext));
};

animationLoop();
