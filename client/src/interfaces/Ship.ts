import { Position } from './Position';

export interface Ship {
    id: string;
    startPosition: Position;
    area: number;
    direction: Direction;
}

export enum Direction {
    HORIZONTAL = 'horizontal',
    VERTICAL = 'vertical',
}
