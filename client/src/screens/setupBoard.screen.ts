import $ from 'jquery';
import { IDS } from '../utils/constants';
import STORAGE from '../utils/storage';
import { createShip } from '../components/ship';
import { Direction, Ship } from '../interfaces/Ship';
import { Position } from '../interfaces/Position';

const shipsState: Ship[] = (STORAGE.ships = []);

export function renderSetupBoardScreen() {
    const boardMarkup = getBoardMarkup(STORAGE.gameConfig.boardSize as number);

    $(IDS.APP).html(`
        <h1>Arrange your ships</h1>
        <div class="board-container">${boardMarkup}</div>
        <div class="options-container"></div>
            
        <button id="start-btn">Start</button>
    `);

    const $optionsContainer = $('.options-container');
    STORAGE.gameConfig.ships.forEach((ship: any) => {
        for (let i = 0; i < ship.count; i++) {
            const $shipEl = createShip(ship.area, true, i);
            $optionsContainer.append($shipEl);
            shipsState.push({
                id: $shipEl.data('ship-id'),
                startPosition: { row: null, col: null },
                direction: Direction.HORIZONTAL,
                area: ship.area as number,
            });
        }
    });

    bindEvents();
}

function getBoardMarkup(boardSize: number): string {
    let boardHtml = '';
    for (let row = 0; row < boardSize; row++) {
        boardHtml += `<div class="board-row">`;
        for (let col = 0; col < boardSize; col++) {
            boardHtml += `
        <div 
          class="board-cell" 
          data-row="${row}" 
          data-col="${col}"
        ></div>`;
        }
        boardHtml += `</div>`;
    }
    return boardHtml;
}

const bindEvents = () => {
    $('.ship').on('dragstart', function (e) {
        const $ship = $(this);
        const shipId = $ship.data('ship-id');
        const length = $ship.data('length');
        const direction = $ship.data('direction');

        e.originalEvent?.dataTransfer?.setData('text/plain', JSON.stringify({ shipId, length, direction }));
    });

    $('.board-cell').on('dragover', function (e) {
        e.preventDefault();
    });

    $('.board-cell').on('drop', function (e) {
        e.preventDefault();

        const $cell = $(this);
        const row = parseInt($cell.data('row'), 10);
        const col = parseInt($cell.data('col'), 10);

        const { shipId, length, direction } = JSON.parse(e.originalEvent?.dataTransfer?.getData('text/plain'));

        updateShipState(shipId, { row, col }, direction);

        placeShipOnBoard(shipId, { row, col }, direction, length);
    });
};

function updateShipState(shipId: string, { row, col }: Position, direction: Direction) {
    const shipIndex = shipsState.findIndex((ship) => ship.id === shipId);

    if (shipIndex !== -1) {
        shipsState[shipIndex] = {
            ...shipsState[shipIndex],
            startPosition: { row, col } as Position,
            direction,
        };
    }
}

function placeShipOnBoard(shipId: string, { row, col }: Position, direction: Direction, length: number) {
    const $boardContainer = $('.board-container');

    for (let i = 0; i < length; i++) {
        const $cell =
            direction === 'horizontal'
                ? $boardContainer.find(`[data-row="${row!}"][data-col="${col! + i}"]`)
                : $boardContainer.find(`[data-row="${row! + i}"][data-col="${col!}"]`);

        $cell.addClass('ship-placed');
        $cell.text(shipId);
    }
}
