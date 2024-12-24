import { GameConfig } from './GameConfig';
import { Cell } from './board/Cell';
import { Position } from './board/Position';

export interface GameData {
    gameId: string;
    players: {
        id: string;
        name: string;
        board: Cell[][] | undefined;
        ships: {
            positions: Position[];
            hits: Position[];
        }[] | undefined;
    }[];
    currentTurn: string | undefined;
    config: GameConfig;
    state: GameState;
    totalPlayers: number;
    waitingPlayers: number;
}

export enum GameState {
    WAITING_FOR_PLAYERS = 0,
    IN_PROGRESS = 1,
    FINISHED = 2
}