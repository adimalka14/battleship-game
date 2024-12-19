import { Position } from "./interfaces/Position";

export class Ship {
    private length: number;
    private positions: Position[] = [];
    private hits: Position[] = [];

    constructor(length: number) {
        this.length = length;
    }

    get Positions() : Position[] {
        return this.positions;
    }

    addPosition(position: Position) : void {
        this.positions.push(position);
    }

    addHit(position: Position) : void {
        this.hits.push(position);
    }

    isSunk() : boolean {
        return this.length === this.hits.length;
    }
}