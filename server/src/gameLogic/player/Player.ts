import { AttackType } from '../attack/Attack';
import { v4 as uuid_v4 } from 'uuid';
import { Ship } from '../ship/Ship';
import { Cell } from '../board/Cell';

const DEFAULT_SHIP_COUNT = 5;

export class Player {
    constructor(
        public readonly id: string,
        public name: string = 'Player',
        public isComputer: boolean = false,
        public isReady: boolean = false,
        private readonly _ships: Ship[] = [],
        public readonly attacks: Map<AttackType, number> = new Map([[AttackType.REGULAR, Infinity]])
    ) {}

    getBoardForPlayer(boardSize: number): Cell[][] {
        return new Array(boardSize).fill(null).map(() => new Array(boardSize).fill(Cell.EMPTY));
    }

    getBoardForEnemy(boardSize: number): Cell[][] {
        return new Array(boardSize).fill(null).map(() => new Array(boardSize).fill(Cell.EMPTY));
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
