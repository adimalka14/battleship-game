import { Cell } from '../board/Cell';
import { Position } from '../board/Position';

export interface Attack {
    name: string;
    description: string;
    execute(board: Cell[][], target: Position): void;
}

export enum AttackType {
    REGULAR = "REGULAR",
    PLUS = "PLUS",
    SCATTER = "SCATTER",
    NUKED = "NUKED",
}