import { Position } from "../board/Position";

export class Ship {

    constructor(
        public length: number,
        public positions: Position[] = [],
        public hits: boolean[] = new Array(positions.length).fill(false)
    ) {}

    addPosition(position: Position) : void {
        this.positions.push(position);
    }

    addHit(position: Position) : void {
        this.hits[this.positions.indexOf(position)] = true;
    }

    isSunk() : boolean {
        return this.length === this.hits.length;
    }
}