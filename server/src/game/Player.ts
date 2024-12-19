import { Board } from './Board';
import { AttackType } from './interfaces/Attack';

const DEFAULT_SHIP_COUNT = 5;
const DEFAULT_BOARD_SIZE = 10;

export class Player {
    name: string;
    id: string;
    attacks: Map<AttackType, number> = new Map();
    shipCount: number;
    board: Board;
    isComputer: boolean;

    constructor(name: string, id: string, shipCount, boardSize) {
        this.name = name;
        this.id = id;
        this.shipCount = shipCount;
        this.board = new Board(boardSize);
        this.addAttack(AttackType.REGULAR, Infinity);
    }

    addAttack(attack: AttackType, limit: number) {
        if (!this.attacks.has(attack)) {
            this.attacks.set(attack, limit);
        }else {
            this.attacks.set(attack, this.attacks.get(attack) + limit);
        }
    }
}