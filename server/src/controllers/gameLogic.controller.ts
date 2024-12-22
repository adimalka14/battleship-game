import { GameEngine } from "../gameLogic/GameEngine";

export const createNewGame = () => {
    const newGame = new GameEngine();
    newGame.init();
    return newGame;
}