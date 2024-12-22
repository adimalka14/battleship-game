import { GameConfig } from './GameConfig';
import { Cell } from './board/Cell';
import { Position } from './board/Position';

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