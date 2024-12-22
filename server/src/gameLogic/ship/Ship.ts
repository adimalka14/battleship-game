import { Position } from "../board/Position";

export class Ship {

    constructor(
        public length: number,
        public positions: Position[] = [],
        public hits: Position[] = []
    ) {}

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