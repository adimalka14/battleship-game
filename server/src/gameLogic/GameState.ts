import { GameConfig } from './GameConfig';
import { Cell } from './board/Cell';
import { Position } from './board/Position';
import { PlayerStatus } from './player/Player';

export interface GameData {
    gameId: string;
    player?: {
        id: string;
        name: string;
        status: PlayerStatus;
        board: Cell[][] | undefined;
        ships: Position[][] | undefined;
    };
    enemies?: {
        id: string;
        name: string;
        status: PlayerStatus;
        board: Cell[][] | undefined;
        sunkShips: Position[][];
    }[];
    currentTurn?: string | undefined;
    config: GameConfig;
    state: GameState;
    totalPlayers: number;
    waitingPlayers: number;
}

export enum GameState {
    WAITING_FOR_PLAYERS = 'WAITING_FOR_PLAYERS',
    SETTING_UP_BOARD = 'SETTING_UP_BOARD',
    IN_PROGRESS = 'IN_PROGRESS',
    FINISHED = 'FINISHED',
}
