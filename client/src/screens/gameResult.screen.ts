import $ from 'jquery';
import { IDS } from '../utils/constants';
import { Position } from '../interfaces/Position';
import { renderBoard } from '../components/board';
import { convertShipsToUIFormat, createShipElement } from '../components/ship';
import { renderOpponentSelectionScreen } from './opponentSelection.screen';

export function renderGameResultScreen(data: any) {
    const { gameData } = data;
    $(IDS.APP).html(`
<div class="game-board result-screen">
    <div class="game-state message result">${gameData?.state} ${gameData?.player?.status}</div>
    <div class="boards-container">
    <div class="board-container">
        <div class="message">your board</div>
        <div class="board-grid">
            <div class="ship-layer game">${getShips(gameData?.player?.ships)}</div>
            <div class="cells-layer game">${renderBoard(gameData?.player?.board)}</div>
        </div>
    </div>
    <div class="board-container">
        <div class="message">enemy board</div>
        <div class="board-grid">
            <div class="ship-layer game">${getShips(gameData?.enemies[0]?.sunkShips)}</div>
            <div class="cells-layer game">${renderBoard(gameData?.enemies[0]?.board)}</div>
        </div>
    </div>
    </div>
    <button id="exit" class="btn exit">Exit</button>
</div>      
`);

    $('#exit').on('click', renderOpponentSelectionScreen);
}

function getShips(ships: Position[][]) {
    return convertShipsToUIFormat(ships)
        .map((ship) => createShipElement(ship, false).prop('outerHTML'))
        .join('');
}
