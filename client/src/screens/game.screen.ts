import $ from 'jquery';
import { IDS, EVENTS } from '../utils/constants';
import { emitEvent, onEvent } from '../utils/socket';
import { renderBoard, renderShipsOnBoard } from '../components/board';
import { convertShipsToUIFormat } from '../components/ship';
import { renderOpponentSelectionScreen } from './opponentSelection.screen';
import { Position } from '../interfaces/Position';
import { renderGameResultScreen } from './gameResult.screen';

let gameState: any;

export function renderGameScreen(data: any) {
    $(IDS.APP).html(`
<button id="exit-btn" class="btn"><i class="fa fa-arrow-circle-o-left" aria-hidden="true"></i></button>
<div class="game-board">
    <div class="game-state message"></div>
    <div class="user-name message"></div>
    <div class="board-container">
        <div class="board-grid">
            <div class="ship-layer game"></div>
            <div class="cells-layer game"></div>
        </div>
</div>
        
        
`);
    bindEvents();

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

    onEvent(EVENTS.UPDATE_BOARD, async (data: any) => {
        const turnChange = data?.gameState?.currentTurn !== gameState?.currentTurn || false;

        gameState = data.gameData;

        for (let i = 0; i < data?.attackResult?.positions?.length; i++) {
            const position = data?.attackResult?.positions[i];
            const result = data?.attackResult?.states[i].toLowerCase();
            await animateResult(result === 'sunk' ? 'hit' : result, position);
        }

        if (gameState?.state === 'FINISHED') return;

        if (data?.attackResult?.states?.some((state: 'MISS' | 'HIT' | 'SUNK') => state === 'MISS')) {
            await flipBoard();
        }

        updateGameBoard();
    });

    onEvent(EVENTS.GAME_FINISHED, (data: any) => {
        renderGameResultScreen(data);
    });
}

function attackerEvent() {
    $('.board-cell').on('click', (e) => {
        const $cell = $(e.currentTarget);

        if (!$cell || !$cell.length) return;

        const row = +($cell?.attr('data-row') as unknown as number);
        const col = +($cell?.attr('data-col') as unknown as number);
        const boardSize = gameState?.config?.boardSize as number;

        if (row < 0 || boardSize <= row || col < 0 || boardSize <= col) return;

        emitEvent(EVENTS.PLAYER_SHOOT, {
            playerBeingAttacked: gameState.enemies[0].id,
            positions: [{ row, col }],
        });
    });
}

async function flipBoard() {
    $('.board-grid').addClass('flip-board');

    setTimeout(() => {
        $('.cells-layer').html(renderBoard());
        renderShipsOnBoard([], false);
    }, 250);

    await new Promise((resolve) => setTimeout(resolve, 500));

    $('.board-grid').removeClass('flip-board');
}

function updateGameBoard() {
    if (gameState.player.id === gameState.currentTurn) {
        $('.game-state').text('Your turn');
        $('.user-name').text(`username : ${gameState.player.name}`);
        $('.cells-layer').html(renderBoard(gameState.enemies[0].board));
        renderShipsOnBoard(convertShipsToUIFormat(gameState?.enemies[0]?.sunkShips));
        attackerEvent();
    } else {
        $('.game-state').text('Wait for opponent turn');
        $('.user-name').text(`username : ${gameState.enemies[0].name}`);
        $('.cells-layer').html(renderBoard(gameState.player.board));
        renderShipsOnBoard(convertShipsToUIFormat(gameState?.player?.ships));
    }
}

async function animateResult(result: string, position: Position) {
    const { row, col } = position;
    const $cell = $(`[data-row="${row}"][data-col="${col}"]`);

    if ($cell.length > 0) {
        $cell.addClass(result);

        await new Promise((resolve) => setTimeout(resolve, 1500));

        $cell?.removeClass(result);
    }
}
