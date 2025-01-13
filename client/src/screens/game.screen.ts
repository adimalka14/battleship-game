import $ from 'jquery';
import { IDS, EVENTS } from '../utils/constants';
import { emitEvent, onEvent } from '../utils/socket';
import { renderBoard } from '../components/board';
import { renderOpponentSelectionScreen } from './opponentSelection.screen';

let gameState: any;

export function renderGameScreen(data: any) {
    $(IDS.APP).html(`
        <div class="game-board">
            <div class="game-state"></div>
              <div class="board-container">
                <div class="cells-layer"></div>
             </div>           
        </div>
        <button id="exit-btn">Exit</button>
`);
    bindEvents();

    if (data?.gameData) {
        gameState = data.gameData;
        updateGameBoard();
    }
}

function bindEvents() {
    $('#exit-btn').on('click', () => {
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
        attackerEvent();
    } else {
        $('.game-state').text('Wait for opponent turn');
        $('.cells-layer').html(renderBoard(gameState.player.board));
    }
}
