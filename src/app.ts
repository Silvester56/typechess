import { Game } from './classes/Game.js';
import { Color, King, Queen, Rook, Bishop, Knight, Pawn } from './classes/Pieces.js';

const canvas: any = document.querySelector('#canvas');
const canvasContext = canvas.getContext('2d');

const chessGame = new Game();
const test = new Queen([0, 0], Color.WHITE);

chessGame.draw(canvasContext);