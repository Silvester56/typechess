import { Game } from './classes/Game.js';
import { Bot, Human, GameState } from './classes/Player.js';
import { Color, Piece, King, Queen, Rook, Bishop, Knight, Pawn } from './classes/Pieces.js';
import { Strategy } from './classes/Strategy.js';
import { Move } from './classes/Move.js';

const canvas: any = document.querySelector('#canvas');
const gameContainer: any = document.querySelector('.game-container');
const logDiv: any = document.querySelector('div.game-log');
const canvasContext = canvas.getContext('2d');

const chessGame = new Game();
let allPieces: Piece[];
let whiteBots = Array.from(Array(10), (_, index) => new Bot(Color.WHITE, new Strategy(Math.random(), 1 + Math.random(), 1 + Math.random(), 10 + Math.random(), 0), 5));
let blackBots = Array.from(Array(10), (_, index) => new Bot(Color.BLACK, new Strategy(Math.random(), 1 + Math.random(), 1 + Math.random(), 10 + Math.random(), 0), 5));
let whiteSlowBot = new Bot(Color.WHITE, new Strategy(Math.random(), 1 + Math.random(), 1 + Math.random(), 10 + Math.random(), 0), 1000);
let blackSlowBot = new Bot(Color.BLACK, new Strategy(Math.random(), 1 + Math.random(), 1 + Math.random(), 10 + Math.random(), 0), 1000);
let movesToDraw: Move[] = [];
let checkToDraw: {positionX: number, positionY: number};

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

const resetScores = (botArray: Bot[]) => {
  for (let botIndex = 0; botIndex < botArray.length; botIndex++) {
    botArray[botIndex].score.winningScore = 0;
    botArray[botIndex].score.materialScore = 0;
  }
};

const logMessage = (message: string) => {
  logDiv.insertAdjacentHTML("beforeend", `<p>${message}</p>`);
  logDiv.scrollTop = logDiv.scrollHeight;
};

const drawAdditionalInformation = (moves: Move[], check: {positionX: number, positionY: number}) => {
  movesToDraw = moves;
  checkToDraw = check;
}

async function buttonAction(buttonId: number) {
  let gameState = GameState.PLAY;
  let generation = 0;
  let turn: number = 0;
  const turnLimit: number = buttonId < 2 ? Infinity : 50;
  let human: Human;
  let whiteSingleGameScore;
  let blackSingleGameScore;

  if (buttonId === 4) {
    gameContainer.setAttribute("class", "game-container hidden");
    logDiv.innerHTML = "";
    buttons.forEach((b, index) => b.setAttribute("class", index === 4 ? "game-mode-button hidden" : "game-mode-button"));
    return;
  }
  gameContainer.setAttribute("class", "game-container");
  buttons.forEach(b => b.setAttribute("class", "game-mode-button hidden"));
  allPieces = Array.from(Array(32), (_, number) => returnPieceFromStartingPosition(number % 8, number < 16 ? Math.floor(number / 8) : 4 + Math.floor(number / 8)));

  human = new Human(buttonId === 0 ? Color.WHITE : Color.BLACK);
  if (buttonId !== 3) {
    while (turn < turnLimit) {
      gameState = buttonId === 0 ? await human.play(allPieces, canvas, drawAdditionalInformation, logMessage) : await whiteSlowBot.play(allPieces, drawAdditionalInformation, logMessage);
      if (gameState !== GameState.PLAY) {
        break;
      }
      gameState = buttonId === 1 ? await human.play(allPieces, canvas, drawAdditionalInformation, logMessage) : await blackSlowBot.play(allPieces, drawAdditionalInformation, logMessage);
      if (gameState !== GameState.PLAY) {
        break;
      }
      gameState = GameState.OUT_OF_TURNS;
      turn++;
    }
    if (gameState === GameState.OUT_OF_TURNS) {
      logMessage("Draw because of turn limit");
    } else if (gameState === GameState.WHITE_WIN) {
      logMessage("White win");
    } else if (gameState === GameState.BLACK_WIN) {
      logMessage("Black win");
    } else if (gameState === GameState.DRAW) {
      logMessage("Draw");
    }
  } else {
    while (generation < 5) {
      resetScores(whiteBots);
      resetScores(blackBots);
      logMessage("Generation " + generation);
      for (let whitePlayerIndex = 0; whitePlayerIndex < whiteBots.length; whitePlayerIndex++) {
        for (let blackPlayerIndex = 0; blackPlayerIndex < blackBots.length; blackPlayerIndex++) {
          logMessage(`White bot ${whitePlayerIndex} versus black bot ${blackPlayerIndex}`);
          turn = 0;
          while (turn < turnLimit) {
            gameState = await whiteBots[whitePlayerIndex].play(allPieces, drawAdditionalInformation);
            if (gameState !== GameState.PLAY) {
              break;
            }
            gameState = await blackBots[blackPlayerIndex].play(allPieces, drawAdditionalInformation);
            if (gameState !== GameState.PLAY) {
              break;
            }
            gameState = GameState.OUT_OF_TURNS;
            turn++;
          }
          if (gameState === GameState.OUT_OF_TURNS) {
            logMessage("Draw because of turn limit");
          } else if (gameState === GameState.WHITE_WIN) {
            logMessage("White win");
          } else if (gameState === GameState.BLACK_WIN) {
            logMessage("Black win");
          } else if (gameState === GameState.DRAW) {
            logMessage("Draw");
          }
          whiteSingleGameScore = whiteBots[whitePlayerIndex].getScore(allPieces, gameState);
          blackSingleGameScore = blackBots[blackPlayerIndex].getScore(allPieces, gameState);
          whiteBots[whitePlayerIndex].score.winningScore = whiteBots[whitePlayerIndex].score.winningScore + whiteSingleGameScore.winningScore;
          whiteBots[whitePlayerIndex].score.materialScore = whiteBots[whitePlayerIndex].score.materialScore + whiteSingleGameScore.materialScore;
          blackBots[blackPlayerIndex].score.winningScore = blackBots[blackPlayerIndex].score.winningScore + blackSingleGameScore.winningScore;
          blackBots[blackPlayerIndex].score.materialScore = blackBots[blackPlayerIndex].score.materialScore + blackSingleGameScore.materialScore;
          allPieces = Array.from(Array(32), (_, number) => returnPieceFromStartingPosition(number % 8, number < 16 ? Math.floor(number / 8) : 4 + Math.floor(number / 8)));
        }
      }
      whiteBots = whiteBots.sort((a, b) => b.score.winningScore === a.score.winningScore ? b.score.materialScore - a.score.materialScore : b.score.winningScore - a.score.winningScore);
      blackBots = blackBots.sort((a, b) => b.score.winningScore === a.score.winningScore ? b.score.materialScore - a.score.materialScore : b.score.winningScore - a.score.winningScore);
      whiteBots.splice(whiteBots.length / 2);
      blackBots.splice(blackBots.length / 2);
      whiteBots = whiteBots.concat(whiteBots.map(p => p.reproduce()));
      blackBots = blackBots.concat(blackBots.map(p => p.reproduce()));
      generation++;
    }
  }
  buttons.forEach((b, index) => b.setAttribute("class", index === 4 ? "game-mode-button" : "game-mode-button hidden"));
}

let buttons = document.querySelectorAll('.game-mode-button');

if (buttons) {
  buttons.forEach(b => b.addEventListener("click", () => {
    buttonAction(Number(b.id.split("-")[1]));
  }));
}

const animationLoop = () => {
  requestAnimationFrame(animationLoop);
  canvasContext.clearRect(0, 0, 500, 500);
  chessGame.draw(canvasContext, false, checkToDraw);
  movesToDraw.forEach(m => m.draw(canvasContext));
  if (allPieces) {
    allPieces.forEach(piece => piece.draw(canvasContext));
  }
};

animationLoop();
