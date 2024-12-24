import $ from 'jquery';
import { IDS } from '../utils/constants';
import storage from '../utils/storage';
import { createShip } from '../components/ship';

export function renderSetupBoardScreen() {
    const boardMarkup = getBoardMarkup(storage.gameConfig.boardSize as number);

    $(IDS.APP).html(`
        <h1>Arrange your ships</h1>
        <div class="board-container">${boardMarkup}</div>
        <div class="options-container"></div>
            
        <button id="start-btn">Start</button>
    `);

    const $optionsContainer = $('.options-container');
    storage.gameConfig.ships.forEach((ship: any) => {
        for (let i = 0; i < ship.count; i++) {
            const $shipEl = createShip(ship.area);
            $optionsContainer.append($shipEl);
        }
    });
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
