import { Attack } from "../attack/Attack";

export enum Cell {
    EMPTY = "EMPTY",
    SHIP = "SHIP",
    HIT_SHIP = "HIT_SHIP",
    SUNK_SHIP = "SUNK_SHIP",
    SPECIAL_ATTACK = "SPECIAL_ATTACK",
    NOT_ALLOWED = "NOT_ALLOWED"
}
