import { Cell, CellContent } from './Cell';
import { Ship } from '../ship/Ship';
import { Position } from './Position';
import { Attack } from '../attack/Attack';
import { BoardSize} from '../consts';

export class Board {

    constructor(
        public readonly boardSize : number = BoardSize.TEN,
        public readonly ships: Ship[] = [],
        public readonly grid: Cell[][] = this.createGrid(this.boardSize),
    ) {}

    placeShip(ship: Ship): void {
        this.ships.push(ship);
        ship.positions.forEach(({ row, col }) =>
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

    private createGrid(size: number): Cell[][] {
        return new Array(size).fill(null).map(() => new Array(size).fill(CellContent.EMPTY));
    }
}