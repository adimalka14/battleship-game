import { Cell } from '../board/Cell';
import { Position } from '../board/Position';

export interface Attack {
    name: string;
    description: string;
    execute(board: Cell[][], target: Position): void;
}

export interface AttackResult {
    type: AttackType;
    states: AttackState[];
    positions: Position[];
    attackedId: string;
    attackerId: string;
}

export enum AttackType {
    REGULAR = 'REGULAR',
    PLUS = 'PLUS',
    SCATTER = 'SCATTER',
    NUKED = 'NUKED',
}

export enum AttackState {
    HIT = 'HIT',
    MISS = 'MISS',
    SUNK = 'SUNK',
}
