import { Game } from './classes/Game.js';
import { Player, Strategy } from './classes/Player.js';
import { Color, Piece, King, Queen, Rook, Bishop, Knight, Pawn } from './classes/Pieces.js';

const canvas: any = document.querySelector('#canvas');
const canvasContext = canvas.getContext('2d');

const chessGame = new Game();
let allPieces: Piece[];
let whitePlayer = new Player(Color.WHITE, Strategy.HYBRID_CASTLE_EARLY);
let blackPlayer = new Player(Color.BLACK, Strategy.RANDOM);

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

async function playerDelay(p: Player, delay: number): Promise<boolean> {
  return new Promise(resolve => {
    setTimeout(() => resolve(p.play(allPieces)), delay);
  });
}

let button = document.querySelector('#start');

async function startGame() {
  while (await playerDelay(whitePlayer, 400) && await playerDelay(blackPlayer, 400)) {
    
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
