import { Game } from './classes/Game.js';
import { Bot, Human, GameState } from './classes/Player.js';
import { Strategy } from './classes/Strategy.js';
import { Move } from './classes/Move.js';
import { Color } from './classes/Pieces.js';

const canvas: any = document.querySelector('#canvas');
const gameContainer: any = document.querySelector('.game-container');
const logDiv: any = document.querySelector('div.game-log');
const canvasContext = canvas.getContext('2d');

const chessGame = new Game();
let whiteBots = Array.from(Array(10), () => new Bot(Color.WHITE, new Strategy(Math.random(), 1 + Math.random(), 1 + Math.random(), 10 + Math.random(), 0), 5));
let blackBots = Array.from(Array(10), () => new Bot(Color.BLACK, new Strategy(Math.random(), 1 + Math.random(), 1 + Math.random(), 10 + Math.random(), 0), 5));
let whiteSlowBot = new Bot(Color.WHITE, new Strategy(Math.random(), 1 + Math.random(), 1 + Math.random(), 10 + Math.random(), 0), 1000);
let blackSlowBot = new Bot(Color.BLACK, new Strategy(Math.random(), 1 + Math.random(), 1 + Math.random(), 10 + Math.random(), 0), 1000);
let movesToDraw: Move[] = [];
let checkToDraw: { positionX: number, positionY: number };

enum GameMode { WHITE_PLAYER, BLACK_PLAYER, PLAYERS, BOTS, TRAINING }

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

const drawAdditionalInformation = (moves: Move[], check: { positionX: number, positionY: number }) => {
  movesToDraw = moves;
  checkToDraw = check;
}

async function buttonAction(buttonId: string) {
  switch (buttonId) {
    case "whiteplayer":
      mainGameLoop(GameMode.WHITE_PLAYER);
      break;
    case "blackplayer":
      mainGameLoop(GameMode.BLACK_PLAYER);
      break;
    case "players":
      mainGameLoop(GameMode.PLAYERS);
      break;
    case "bots":
      mainGameLoop(GameMode.BOTS);
      break;
    case "training":
      mainGameLoop(GameMode.TRAINING);
      break;
    case "return":
      chessGame.reset();
      gameContainer.setAttribute("class", "game-container hidden");
      logDiv.innerHTML = "";
      buttons.forEach(b => b.setAttribute("class", b.id === "return" ? "game-mode-button hidden" : "game-mode-button"));
      break;
    default:
      break;
  }
}

async function mainGameLoop(gameMode: GameMode) {
  let gameState = GameState.PLAY;
  let generation = 0;
  let turn: number = 0;
  const turnLimit: number = (gameMode === GameMode.TRAINING || gameMode === GameMode.BOTS) ? 50 : Infinity;
  let whitePlayer: Human | Bot;
  let blackPlayer: Human | Bot;
  let whiteSingleGameScore;
  let blackSingleGameScore;

  gameContainer.setAttribute("class", "game-container");
  buttons.forEach(b => b.setAttribute("class", "game-mode-button hidden"));

  whitePlayer = (gameMode === GameMode.WHITE_PLAYER || gameMode === GameMode.PLAYERS) ? new Human(Color.WHITE) : whiteSlowBot;
  blackPlayer = (gameMode === GameMode.BLACK_PLAYER || gameMode === GameMode.PLAYERS) ? new Human(Color.BLACK) : blackSlowBot;
  if (gameMode != GameMode.TRAINING) {
    while (turn < turnLimit) {
      gameState = await whitePlayer.play(chessGame, canvas, drawAdditionalInformation, logMessage);
      if (gameState !== GameState.PLAY) {
        break;
      }
      gameState = await blackPlayer.play(chessGame, canvas, drawAdditionalInformation, logMessage);
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
      for (let whiteBotIndex = 0; whiteBotIndex < whiteBots.length; whiteBotIndex++) {
        for (let blackBotIndex = 0; blackBotIndex < blackBots.length; blackBotIndex++) {
          logMessage(`White bot ${whiteBotIndex} versus black bot ${blackBotIndex}`);
          turn = 0;
          while (turn < turnLimit) {
            gameState = await whiteBots[whiteBotIndex].play(chessGame, canvas, drawAdditionalInformation);
            if (gameState !== GameState.PLAY) {
              break;
            }
            gameState = await blackBots[blackBotIndex].play(chessGame, canvas, drawAdditionalInformation);
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
          whiteSingleGameScore = whiteBots[whiteBotIndex].getScore(chessGame, gameState);
          blackSingleGameScore = blackBots[blackBotIndex].getScore(chessGame, gameState);
          whiteBots[whiteBotIndex].score.winningScore = whiteBots[whiteBotIndex].score.winningScore + whiteSingleGameScore.winningScore;
          whiteBots[whiteBotIndex].score.materialScore = whiteBots[whiteBotIndex].score.materialScore + whiteSingleGameScore.materialScore;
          blackBots[blackBotIndex].score.winningScore = blackBots[blackBotIndex].score.winningScore + blackSingleGameScore.winningScore;
          blackBots[blackBotIndex].score.materialScore = blackBots[blackBotIndex].score.materialScore + blackSingleGameScore.materialScore;
          chessGame.reset();
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
  buttons.forEach(b => b.setAttribute("class", b.id === "return" ? "game-mode-button" : "game-mode-button hidden"));
}

let buttons = document.querySelectorAll('.game-mode-button');

if (buttons) {
  buttons.forEach(b => b.addEventListener("click", () => {
    buttonAction(b.id);
  }));
}

const animationLoop = () => {
  requestAnimationFrame(animationLoop);
  canvasContext.clearRect(0, 0, 500, 500);
  chessGame.draw(canvasContext, false, checkToDraw);
  movesToDraw.forEach(m => m.draw(canvasContext));
};

animationLoop();
