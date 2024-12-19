import { GameConfig } from './GameConfig';
import { Cell } from './Cell';
import { Position } from './Position';

export interface GameState {
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
    state: string;
}