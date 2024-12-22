import { GameConfig } from './GameConfig';
import { Cell } from './board/Cell';
import { Position } from './board/Position';

export interface GameData {
    gameId: string;
    players: {
        id: string;
        name: string;
        board: Cell[][];
        ships: {
            positions: Position[];
            hits: Position[];
        }[];
    }[];
    currentTurn: string;
    config: GameConfig;
    state: GameState;
}

export enum GameState {
    WAITING_FOR_PLAYERS = 0,
    IN_PROGRESS = 1,
    FINISHED = 2
}