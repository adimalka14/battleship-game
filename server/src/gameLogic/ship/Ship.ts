import { Position } from '../board/Position';

export class Ship {
    constructor(
        public positions: Position[] = [],
        public hits: boolean[] = []
    ) {
        this.hits = this.hits || new Array(positions.length).fill(false);
    }

    clone(): Ship {
        return new Ship(
            //this.positions.map((pos) => ({ row: pos.row, col: pos.col })),
            [...this.positions],
            [...this.hits]
        );
    }

    addPosition(position: Position): void {
        this.positions.push(position);
    }

    addHit(position: Position): void {
        this.hits[this.positions.indexOf(position)] = true;
    }

    isSunk(): boolean {
        return this.positions.length === this.hits.filter((hit) => hit).length;
    }
}
