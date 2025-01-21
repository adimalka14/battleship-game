import { AttackState, AttackType } from '../attack/Attack';
import { Ship } from '../ship/Ship';
import { Cell } from '../board/Cell';
import { Position } from '../board/Position';
import { updateOutput } from 'ts-jest/dist/legacy/compiler/compiler-utils';

export class Player {
    constructor(
        public readonly id: string,
        public name: string = 'Player',
        public isComputer: boolean = false,
        private _status: PlayerStatus = PlayerStatus.CONNECTED,
        private _ships: Ship[] = [],
        private _revealedPositions: Set<string> = new Set(),
        private _attacks: Map<AttackType, number> = new Map([[AttackType.REGULAR, Infinity]])
    ) {}

    beingAttacked(positions: Position[]): AttackState[] {
        const attacksState: AttackState[] = [];

        for (const position of positions) {
            if (this.isPositionRevealed(position)) throw new Error('Position already revealed');
        }

        for (const position of positions) {
            this.revealPosition(position);
        }

        for (const position of positions) {
            attacksState.push(this.checkAttackResult(position));
        }
        this.updateIfLose();

        return attacksState;
    }

    checkAttackResult(position: Position): AttackState {
        for (const ship of this._ships) {
            for (let i = 0; i < ship.positions.length; i++) {
                const { row: x, col: y } = ship.positions[i];
                if (position.row === x && position.col === y) {
                    ship.hits[i] = true;
                    return ship.isSunk() ? AttackState.SUNK : AttackState.HIT;
                }
            }
        }

        return AttackState.MISS;
    }

    clone(): Player {
        return new Player(
            'Bot ' + this.id,
            this.name,
            false,
            PlayerStatus.RETIRED,
            this._ships.map((ship) => ship.clone()),
            new Set([...this._revealedPositions])
        );
    }

    revealPosition(position: Position): void {
        this._revealedPositions.add(`${position.row},${position.col}`);
    }

    isPositionRevealed(position: Position): boolean {
        return this._revealedPositions.has(`${position.row},${position.col}`);
    }

    getBoard(boardSize: number, isPlayer: boolean): Cell[][] {
        const board = new Array(boardSize).fill(null).map(() => new Array(boardSize).fill(Cell.NOT_REVEALED));

        for (const position of this._revealedPositions) {
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

    reset() {
        this._revealedPositions = new Set();
        this.status = PlayerStatus.CONNECTED;
        this._attacks = new Map([[AttackType.REGULAR, Infinity]]);
        this._ships = [];
    }

    get status(): PlayerStatus {
        return this._status;
    }

    set status(status: PlayerStatus) {
        this._status = status;
    }

    get ships(): Ship[] {
        return this._ships;
    }

    set ships(ships: Ship[]) {
        this.ships.length = 0;
        this.ships.push(...ships);
    }

    private updateIfLose() {
        if (this.ships.every((ship) => ship.isSunk())) {
            this.status = PlayerStatus.LOOSER;
        }
    }

    addAttack(attack: AttackType, limit: number) {
        if (!this._attacks.has(attack)) {
            this._attacks.set(attack, limit);
        } else {
            const currentLimit = this._attacks.get(attack)!;
            if (currentLimit !== undefined) this._attacks.set(attack, currentLimit + limit);
        }
    }
}

export enum PlayerStatus {
    CONNECTED = 'connected',
    WAITING = 'waiting',
    PLAYING = 'playing',
    WINNER = 'winner',
    LOOSER = 'looser',
    DISCONNECTED = 'disconnected',
    RETIRED = 'retired',
}
