import { Board } from '../board/Board';
import { AttackType } from '../attack/Attack';
import {v4 as uuid_v4 } from "uuid";

const DEFAULT_SHIP_COUNT = 5;

export class Player {
    constructor(
        public readonly id: string,
        public name: string = "Player",
        public isComputer: boolean = false,
        public  board: Board | undefined = undefined,
        public readonly attacks: Map<AttackType, number> = new Map([[AttackType.REGULAR, Infinity]]),
    ) {}

    addAttack(attack: AttackType, limit: number) {
        if (!this.attacks.has(attack)) {
            this.attacks.set(attack, limit);
        }else {
            this.attacks.set(attack, this.attacks.get(attack) + limit);
        }
    }
}