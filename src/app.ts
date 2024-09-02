import { Game } from './classes/Game.js';
import { Bot, Human, Player } from './classes/Player.js';
import { Color, Piece, King, Queen, Rook, Bishop, Knight, Pawn } from './classes/Pieces.js';
import { Strategy } from './classes/Strategy.js';

const canvas: any = document.querySelector('#canvas');
const canvasContext = canvas.getContext('2d');

const chessGame = new Game();
let allPieces: Piece[];
let whitePlayer = new Bot(Color.WHITE, new Strategy(1, 1, 1, Infinity, 0));
let blackPlayer = new Bot(Color.BLACK, new Strategy(1, 1, 1, Infinity, 0));

const returnPieceFromStartingPosition = (x: number, y: number): Piece => {
  let color = y < 4 ? Color.BLACK : Color.WHITE;

  if (y === 0 || y === 7) {
    if (x === 0 || x === 7) {
      return new Rook(x, y, color);
    } else if (x === 1 || x === 6) {
      return new Knight(x, y, color);
    } else if (x === 2 || x === 5) {
      return new Bishop(x, y, color);
    } else if (x === 3) {
      return new Queen(x, y, color);
    } else {
      return new King(x, y, color);
    }
  }
  return new Pawn(x, y, color);
};

allPieces = Array.from(Array(32), (_, number) => returnPieceFromStartingPosition(number % 8, number < 16 ? Math.floor(number / 8) : 4 + Math.floor(number / 8)));

async function startGame() {
  while (await whitePlayer.play(allPieces) && await blackPlayer.play(allPieces)) {
    
  }
}

let button = document.querySelector('#start');

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
