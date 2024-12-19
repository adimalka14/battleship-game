import { Cell, CellContent } from './interfaces/Cell';
import { Ship } from './Ship';
import { Position } from './interfaces/Position';
import { Attack } from './interfaces/Attack';

export class Board {
    private readonly grid: Cell[][];
    private readonly ships: Ship[] = [];

    constructor(size: number) {
        this.grid = this.createGrid(size);
    }

    get grid(): Cell[][] {
        return this.grid;
    }

    private createGrid(size: number): Cell[][] {
        return new Array(size).fill(null).map(() => new Array(size).fill(CellContent.EMPTY));
    }

    placeShip(ship: Ship): void {
        this.ships.push(ship);
        ship.Positions.forEach(({ row, col }) =>
            this.grid[row][col] = { isRevealed: false, content: CellContent.SHIP });
    }

    placeSpecialAttack(position: Position, attackType: Attack): void {
        this.grid[position.row][position.col] = {
            isRevealed: false,
            content: CellContent.SPECIAL_ATTACK,
            specialAttack: attackType
        };
    }

    checkHit({ row, col }: Position): CellContent {
        const cell = this.grid[row][col];
        if (cell.isRevealed) throw new Error("Cell already revealed");

        return cell.content;
    }
}