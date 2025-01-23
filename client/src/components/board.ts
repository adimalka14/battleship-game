import $ from 'jquery';
import { Cell } from '../interfaces/Cell';
import STORAGE from '../utils/storage';
import { Ship } from '../interfaces/Ship';
import { createShipElement, isShipOverlapping } from './ship';

let BOARD_SIZE = (STORAGE?.GAME_CONFIG?.boardSize as number) || 10;
const EMPTY_BOARD = new Array(BOARD_SIZE)
    .fill(Cell.NOT_REVEALED)
    .map(() => new Array(BOARD_SIZE).fill(Cell.NOT_REVEALED));

const CELL_STATUS = {
    0: 'not-revealed',
    1: 'empty',
    2: 'ship',
    3: 'hit-ship',
    4: 'sunk-ship',
};

export function renderBoard(board: Cell[][] = EMPTY_BOARD): string {
    let boardHtml = '';
    for (let row = 0; row < BOARD_SIZE; row++) {
        boardHtml += `<div class="board-row">`;
        for (let col = 0; col < BOARD_SIZE; col++) {
            boardHtml += `
        <div 
          class="board-cell" 
          data-row="${row}" 
          data-col="${col}"
          data-value="${CELL_STATUS[board[row][col]]}"
        >
        <div class="icon"></div>
</div>`;
        }
        boardHtml += `</div>`;
    }
    return boardHtml;
}

export function renderShipsOnBoard(ships: Ship[], draggable: boolean = false) {
    $('.board-container .ship-layer').empty();

    ships.forEach((ship) => {
        const $shipEl = createShipElement(ship, draggable);
        $('.board-container .ship-layer').append($shipEl);
    });
}

export function getCellSize() {
    return parseFloat($('.board-cell').css('width'));
}

export function isBoardIllegal(ships: Ship[]): boolean {
    for (let i = 0; i < ships.length; i++) {
        for (let j = i + 1; j < ships.length; j++) {
            if (isShipOverlapping(ships[i], ships[j])) {
                return true;
            }
        }
    }
    return false;
}
