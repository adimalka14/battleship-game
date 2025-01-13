import { AttackResult, AttackType } from '../attack/Attack';
import { v4 as uuid_v4 } from 'uuid';
import { Ship } from '../ship/Ship';
import { Cell } from '../board/Cell';
import { Position } from '../board/Position';

const DEFAULT_SHIP_COUNT = 5;

export class Player {
    constructor(
        public readonly id: string,
        public name: string = 'Player',
        public isComputer: boolean = false,
        public isReady: boolean = false,
        private readonly _ships: Ship[] = [],
        private revealedPositions: Set<string> = new Set(),
        public readonly attacks: Map<AttackType, number> = new Map([[AttackType.REGULAR, Infinity]])
    ) {}

    beingAttacked(position: Position): AttackResult {
        console.log(this.revealedPositions);
        if (this.isPositionRevealed(position)) throw new Error('Position already revealed');

        this.revealPosition(position);

        for (const ship of this._ships) {
            for (let i = 0; i < ship.positions.length; i++) {
                const { row: x, col: y } = ship.positions[i];
                if (position.row === x && position.col === y) {
                    ship.hits[i] = true;
                    return ship.isSunk() ? AttackResult.SUNK : AttackResult.HIT;
                }
            }
        }
        return AttackResult.MISS;
    }

    revealPosition(position: Position): void {
        this.revealedPositions.add(`${position.row},${position.col}`);
    }

    isPositionRevealed(position: Position): boolean {
        return this.revealedPositions.has(`${position.row},${position.col}`);
    }

    getBoard(boardSize: number, isPlayer: boolean): Cell[][] {
        const board = new Array(boardSize)
            .fill(null)
            .map(() => new Array(boardSize).fill(isPlayer ? Cell.EMPTY : Cell.NOT_REVEALED));

        for (const position of this.revealedPositions) {
            const [y, x] = position.split(',').map(Number);
            board[y][x] = Cell.EMPTY;
        }

        for (const ship of this._ships) {
            for (let i = 0; i < ship.positions.length; i++) {
                const { row: x, col: y } = ship.positions[i];
                if (ship.isSunk()) {
                    board[x][y] = Cell.SUNK_SHIP;
                } else if (ship.hits[i]) {
                    board[x][y] = Cell.HIT_SHIP;
                } else if (isPlayer) {
                    board[x][y] = Cell.SHIP;
                }
            }
        }
        return board;
    }

    get ships(): Ship[] {
        return this._ships;
    }

    set ships(ships: Ship[]) {
        this.ships.length = 0;
        this.ships.push(...ships);
    }

    addAttack(attack: AttackType, limit: number) {
        if (!this.attacks.has(attack)) {
            this.attacks.set(attack, limit);
        } else {
            const currentLimit = this.attacks.get(attack)!;
            if (currentLimit !== undefined) this.attacks.set(attack, currentLimit + limit);
        }
    }
}
