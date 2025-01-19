import $ from 'jquery';
import { IDS, EVENTS } from '../utils/constants';
import { emitEvent, onEvent } from '../utils/socket';
import { renderBoard, renderShipsOnBoard } from '../components/board';
import { renderOpponentSelectionScreen } from './opponentSelection.screen';
import { Direction, Ship } from '../interfaces/Ship';
import { Position } from '../interfaces/Position';

let gameState: any;

export function renderGameScreen(data: any) {
    console.log(data);
    $(IDS.APP).html(`
<button id="exit-btn" class="btn"><i class="fa fa-arrow-circle-o-left" aria-hidden="true"></i></button>
<div class="game-board">
    <div class="game-state message"></div>
    <div class="board-container">
        <div class="board-grid">
            <div class="ship-layer game"></div>
            <div class="cells-layer game"></div>
        </div>
                
<!--    <div class="board-container">-->
<!--        <div class="board-grid">-->
<!--            <div class="ship-layer game"></div>-->
<!--            <div class="cells-layer game"></div>-->
<!--        </div>-->
<!--    </div>-->
</div>
        
        
`);
    bindEvents();

    // $('.cells-layer').css({
    //     position: 'absolute',
    //     zIndex: 12,
    // });

    if (data?.gameData) {
        gameState = data.gameData;
        updateGameBoard();
    }
}

function bindEvents() {
    $('#exit-btn').on('click', () => {
        if (gameState && gameState?.state !== 'FINISHED') emitEvent(EVENTS.LEAVE_GAME, {});
        renderOpponentSelectionScreen();
    });

    onEvent(EVENTS.UPDATE_BOARD, (data: any) => {
        if (data?.attackResult) {
            console.log(data.attackResult);
        }

        gameState = data.gameData;
        console.log(data);
        updateGameBoard();
    });

    onEvent(EVENTS.GAME_FINISHED, (data: any) => {
        if (data?.attackResult) {
            console.log(data.attackResult);
        }

        gameState = data.gameData;
        console.log(data);
        updateGameBoard();
        $('.game-state').text(`${gameState?.state} ${gameState?.player?.status}`);
    });
}

function attackerEvent() {
    $('.board-cell').on('click', (e) => {
        const $cell = $(e.currentTarget);
        const row = +$cell.attr('data-row');
        const col = +$cell.attr('data-col');
        emitEvent(EVENTS.PLAYER_SHOOT, {
            playerBeingAttacked: gameState.enemies[0].id,
            position: {
                row,
                col,
            },
        });
    });
}

function updateGameBoard() {
    if (gameState.player.id === gameState.currentTurn) {
        $('.game-state').text('Your turn');
        $('.cells-layer').html(renderBoard(gameState.enemies[0].board));
        renderShipsOnBoard(convertShipsToUIFormat(gameState?.enemies[0]?.sunkShips));
        attackerEvent();
    } else {
        $('.game-state').text('Wait for opponent turn');
        $('.cells-layer').html(renderBoard(gameState.player.board));
        renderShipsOnBoard(convertShipsToUIFormat(gameState?.player?.ships.map((ship) => ship.positions)));
    }
}

const convertShipsToUIFormat = (ships: Position[][]): Ship[] => {
    return ships.map((ship, i) => {
        return {
            id: `ship-${ship.length}-${i}`,
            startPosition: ship[0],
            direction: ship[0].row === ship[1].row ? Direction.HORIZONTAL : Direction.VERTICAL,
            area: ship.length as number,
        };
    });
};
