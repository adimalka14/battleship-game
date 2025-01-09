import { Position } from './Position';

export interface Ship {
    id: string;
    startPosition: Position | null;
    area: number;
    direction: Direction;
}

export enum Direction {
    HORIZONTAL = 'horizontal',
    VERTICAL = 'vertical',
}
