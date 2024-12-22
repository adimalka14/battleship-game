import { Attack } from "../attack/Attack";

export interface Cell {
    isRevealed: boolean;
    content: CellContent;
    specialAttack?: Attack;
}

export enum CellContent {
    EMPTY = "EMPTY",
    SHIP = "SHIP",
    HIT_SHIP = "HIT_SHIP",
    SUNK_SHIP = "SUNK_SHIP",
    SPECIAL_ATTACK = "SPECIAL_ATTACK",
    NOT_ALLOWED = "NOT_ALLOWED"
}
