import $ from 'jquery';
import { Cell } from '../interfaces/Cell';
import STORAGE from '../utils/storage';
import { Ship } from '../interfaces/Ship';
import { createShipElement } from './ship';

let BOARD_SIZE = (STORAGE?.GAME_CONFIG?.boardSize as number) || 10;
const EMPTY_BOARD = new Array(BOARD_SIZE).fill(Cell.EMPTY).map(() => new Array(BOARD_SIZE).fill(Cell.EMPTY));

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
        >${board[row][col]}</div>`;
        }
        boardHtml += `</div>`;
    }
    return boardHtml;
}

export function renderShipsOnBoard(ships: Ship[], draggable: boolean = false) {
    $('.board-container .ship-layer').empty();

    ships.forEach((ship) => {
        const $shipEl = createShipElement(ship, getCellSize(), draggable);
        $('.board-container .ship-layer').append($shipEl);
    });
}

export function getCellSize() {
    return parseFloat($('.board-cell').css('width'));
}
