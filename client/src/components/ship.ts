import $ from 'jquery';
import { Ship, Direction } from '../interfaces/Ship';
import { Position } from '../interfaces/Position';

export function defineShips(shipsConfig: any[]): Ship[] {
    const ships: Ship[] = [];

    shipsConfig.forEach((ship: any) => {
        for (let i = 0; i < ship.count; i++) {
            ships.push({
                id: `ship-${ship.area}-${i}`,
                startPosition: null,
                direction: Direction.HORIZONTAL,
                area: ship.area as number,
            });
        }
    });

    return ships;
}
// export function createShipElement(ship: Ship, cellSize: number, draggable: boolean): JQuery<HTMLElement> {
//     const { row, col } = ship.startPosition;
//     const containerOffset = $('.board-container').offset() || { top: 0, left: 0 };
//
//     const topPx = row * cellSize + containerOffset.top;
//     const leftPx = col * cellSize + containerOffset.left;
//
//     return $('<div>', {
//         class: `ship ship-area-${ship.area}`,
//         css: {
//             top: `${topPx}px`,
//             left: `${leftPx}px`,
//             width: ship.direction === Direction.HORIZONTAL ? ship.area * cellSize : cellSize,
//             height: ship.direction === Direction.VERTICAL ? ship.area * cellSize : cellSize,
//         },
//         draggable: draggable,
//     });
// }

export function createShipElement(ship: Ship, cellSize: number, draggable: boolean): JQuery<HTMLElement> {
    const { row, col } = ship.startPosition;
    const topPx = row * cellSize;
    const leftPx = col * cellSize;

    const widthPx = ship.direction === Direction.HORIZONTAL ? ship.area * cellSize : cellSize;

    const heightPx = ship.direction === Direction.VERTICAL ? ship.area * cellSize : cellSize;

    return $('<div>', {
        class: `ship ship-area-${ship.area}`,
        css: {
            top: `${topPx}px`,
            left: `${leftPx}px`,
            width: `${widthPx}px`,
            height: `${heightPx}px`,
        },
        'data-ship-id': ship.id,
        'data-direction': ship.direction,
        'data-area': ship.area,
        draggable: draggable,
    });
}

export function placeShipsRandomly(ships: Ship[], boardSize: number): Ship[] {
    const occupiedPositions: Set<string> = new Set();

    const getCol = (i: number, col: number, direction: Direction): number => {
        return direction === Direction.HORIZONTAL ? col + i : col;
    };

    const getRow = (i: number, row: number, direction: Direction): number => {
        return direction === Direction.VERTICAL ? row + i : row;
    };

    const isOccupied = (row: number, col: number): boolean => {
        return row >= boardSize || col >= boardSize || occupiedPositions.has(`${row},${col}`);
    };

    const canPlaceShip = (row: number, col: number, length: number, direction: Direction): boolean => {
        for (let i = 0; i < length; i++) {
            const currentRow = getRow(i, row, direction);
            const currentCol = getCol(i, col, direction);

            if (isOccupied(currentRow, currentCol)) {
                return false;
            }
        }
        return true;
    };

    const markOccupiedPositions = (row: number, col: number, length: number, direction: Direction) => {
        for (let i = 0; i < length; i++) {
            const currentRow = getRow(i, row, direction);
            const currentCol = getCol(i, col, direction);
            occupiedPositions.add(`${currentRow},${currentCol}`);
        }
    };

    ships.forEach((ship) => {
        let placed = false;

        while (!placed) {
            const randomDirection = Math.random() < 0.5 ? Direction.HORIZONTAL : Direction.VERTICAL;

            const randomRow = Math.floor(
                Math.random() * (boardSize - (randomDirection === Direction.VERTICAL ? ship.area - 1 : 0))
            );

            const randomCol = Math.floor(
                Math.random() * (boardSize - (randomDirection === Direction.HORIZONTAL ? ship.area - 1 : 0))
            );

            if (canPlaceShip(randomRow, randomCol, ship.area, randomDirection)) {
                ship.startPosition = { row: randomRow, col: randomCol };
                ship.direction = randomDirection;

                markOccupiedPositions(randomRow, randomCol, ship.area, randomDirection);
                placed = true;
            }
        }
    });

    return ships;
}

export function isAllShipsPlaced(ships: Ship[]): boolean {
    return ships.every((ship) => ship.startPosition !== null);
}

export function convertShipToServerFormat(ship: Ship): Position[] {
    const positions: Position[] = [];
    for (let i = 0; i < ship.area; i++) {
        const newRow = ship.direction === Direction.VERTICAL ? ship.startPosition!.row + i : ship.startPosition!.row;
        const newCol = ship.direction === Direction.HORIZONTAL ? ship.startPosition!.col + i : ship.startPosition!.col;
        positions.push({ row: newRow, col: newCol });
    }

    return positions;
}
