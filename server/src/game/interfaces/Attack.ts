import { Cell } from './Cell';
import { Position } from './Position';

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