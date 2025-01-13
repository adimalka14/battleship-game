import $ from 'jquery';
import { IDS, EVENTS } from '../utils/constants';
import { emitEvent, onEvent } from '../utils/socket';
import { renderBoard } from '../components/board';

let gameState: any;

export function renderGameScreen() {
    $(IDS.APP).html(`
        <div class="game-board">
            <div class="game-state"></div>
              <div class="board-container">
                <div class="cells-layer"></div>
             </div>           
        </div>`);
    emitEvent(EVENTS.GET_GAME_DATA, {});
    bindEvents();
}

function bindEvents() {
    onEvent(EVENTS.UPDATE_BOARD, (data: any) => {
        console.log(data);
        if (data.player.id === data.currentTurn) {
            gameState = data;
            $('.game-state').text('Your turn');
            $('.cells-layer').html(renderBoard(data.enemies[0].board));
            attackerEvent();
        } else {
            gameState = data;
            $('.game-state').text('Wait for opponent turn');
            $('.cells-layer').html(renderBoard(data.player.board));
        }
    });

    onEvent(EVENTS.ATTACK_RESULT, (data: any) => {
        console.log(data);
        emitEvent(EVENTS.GET_GAME_DATA, {});
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
