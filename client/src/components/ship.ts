import $ from 'jquery';
import { Ship, Direction } from '../interfaces/Ship';
import { Position } from '../interfaces/Position';

export function defineShips(shipsConfig: any[], boardSize: number): Ship[] {
    const ships: Ship[] = [];

    shipsConfig.forEach((ship: any) => {
        for (let i = 0; i < ship.count; i++) {
            ships.push({
                id: `ship-${ship.area}-${i}`,
                startPosition: { row: 0, col: 0 },
                direction: Direction.HORIZONTAL,
                area: ship.area as number,
            });
        }
    });

    placeShipsRandomly(ships, boardSize);

    return ships;
}

export function findShipById(ships: Ship[], id: string): Ship | undefined {
    return ships.find((ship) => ship.id === id);
}

export function updateShip(ship: Ship, startPosition: Position, direction: Direction | undefined = undefined) {
    ship.startPosition = startPosition;
    if (direction !== undefined) ship.direction = direction;
}

export function flipShip(ship: Ship, clickIndex: number, boardSize: number): void {
    const { row: currRow, col: currCol } = ship.startPosition;
    const currentDirection = ship.direction;
    const shipArea = ship.area;

    if (currentDirection === Direction.VERTICAL) {
        ship.startPosition = {
            row: Math.max(0, currRow + clickIndex),
            col: Math.max(0, Math.min(currCol - (shipArea - clickIndex - 1), boardSize - shipArea)),
        };
        ship.direction = Direction.HORIZONTAL;
    } else {
        ship.startPosition = {
            row: Math.max(0, Math.min(Math.max(0, currRow - clickIndex), boardSize - shipArea)),
            col: currCol + clickIndex,
        };
        ship.direction = Direction.VERTICAL;
    }
}

export function createShipElement(ship: Ship, draggable: boolean): JQuery<HTMLElement> {
    const { row, col } = ship.startPosition;

    return $('<div>', {
        class: `ship ship-area-${ship.area}`,
        css: {
            gridColumnStart: col + 1,
            gridColumnEnd: ship.direction === Direction.HORIZONTAL ? `span ${ship.area}` : 'span 1',
            gridRowStart: row + 1,
            gridRowEnd: ship.direction === Direction.VERTICAL ? `span ${ship.area}` : 'span 1',
        },
        'data-ship-id': ship.id,
        'data-direction': ship.direction,
        'data-area': ship.area,
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

export function updateAllShipsOverlap(ships: Ship[]) {
    $('.ship').attr('data-overlapping', 'false').css('background-color', '');

    ships.forEach((shipA) => {
        const overlapping = ships.some((shipB) => {
            if (shipA.id === shipB.id) return false;
            return isShipOverlapping(shipA, shipB);
        });

        const $shipElement = $(`[data-ship-id="${shipA.id}"]`);
        if (overlapping) {
            $shipElement.attr('data-overlapping', 'true');
        } else {
            $shipElement.attr('data-overlapping', 'false');
        }
    });
}

export function isShipOverlapping(shipA: Ship, shipB: Ship): boolean {
    if (!shipA.startPosition || !shipB.startPosition) {
        return false;
    }

    const shipACells: Position[] = [];
    for (let i = 0; i < shipA.area; i++) {
        shipACells.push(
            shipA.direction === Direction.HORIZONTAL
                ? { row: shipA.startPosition.row, col: shipA.startPosition.col + i }
                : { row: shipA.startPosition.row + i, col: shipA.startPosition.col }
        );
    }

    const shipBCells: Position[] = [];
    for (let i = 0; i < shipB.area; i++) {
        shipBCells.push(
            shipB.direction === Direction.HORIZONTAL
                ? { row: shipB.startPosition.row, col: shipB.startPosition.col + i }
                : { row: shipB.startPosition.row + i, col: shipB.startPosition.col }
        );
    }

    return shipACells.some((cellA) => shipBCells.some((cellB) => cellA.row === cellB.row && cellA.col === cellB.col));
}

export const convertShipsToUIFormat = (ships: Position[][]): Ship[] => {
    return ships.map((ship, i) => {
        return {
            id: `ship-${ship.length}-${i}`,
            startPosition: ship[0],
            direction: ship[0].row === ship[1].row ? Direction.HORIZONTAL : Direction.VERTICAL,
            area: ship.length as number,
        };
    });
};
