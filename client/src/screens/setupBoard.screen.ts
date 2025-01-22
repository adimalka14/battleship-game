import $ from 'jquery';
import 'jquery-ui/ui/widgets/draggable';
import 'jquery-ui/ui/widgets/droppable';
import interact from 'interactjs';

import { EVENTS, IDS } from '../utils/constants';
import STORAGE from '../utils/storage';
import {
    convertShipToServerFormat,
    defineShips,
    findShipById,
    isAllShipsPlaced,
    placeShipsRandomly,
    updateShip,
    flipShip,
    updateAllShipsOverlap,
} from '../components/ship';
import { Direction, Ship } from '../interfaces/Ship';
import { Position } from '../interfaces/Position';
import { getCellSize, isBoardIllegal, renderBoard, renderShipsOnBoard } from '../components/board';
import { renderGameScreen } from './game.screen';
import { emitEvent, onEvent } from '../utils/socket';
import { renderOpponentSelectionScreen } from './opponentSelection.screen';
import { renderFindOpponentScreen } from './findOpponent.screen';

let BOARD_SIZE: number;

export function renderSetupBoardScreen() {
    BOARD_SIZE = STORAGE.GAME_CONFIG.boardSize;
    STORAGE.SHIPS = STORAGE.SHIPS ?? defineShips(STORAGE.GAME_CONFIG.ships);
    !isAllShipsPlaced(STORAGE.SHIPS) && placeShipsRandomly(STORAGE.SHIPS, BOARD_SIZE);

    console.log(STORAGE.SHIPS);

    const boardMarkup = renderBoard();

    $(IDS.APP).html(`
        <button id="exit-btn" class="btn"><i class="fa fa-arrow-circle-o-left" aria-hidden="true"></i></button>
        <div class="game-board">
            <h1>Arrange your ships</h1>
            <p class="message">players ready:<span class="waiting-players">0</span>/<span class="total-players">${STORAGE.GAME_CONFIG.numOfPlayers}</span></p>
            <div class="board-container">
                <div class="board-grid">
                    <div class="cells-layer setup">${boardMarkup}</div>
                    <div class="ship-layer setup"></div>
                </div>  
            </div>
            <div class="btn-container">  
                <button id="random-btn" class="btn">Random</button>
                <button id="start-btn" class="btn">Start</button>
            </div> 
        </div>
        <div class="game-message message hide">
            <p>waiting for opponent...</p>
        </div>
    `);
    renderShipsOnBoard(STORAGE.SHIPS, true);
    bindEvents();
}

function initShipsWithRotation() {
    const cellSize = getCellSize();
    let isDragging = false;

    interact('.ship').unset();

    interact('.ship')
        .draggable({
            modifiers: [
                interact.modifiers.snap({
                    targets: [interact.snappers.grid({ x: cellSize, y: cellSize })],
                    range: Infinity,
                    relativePoints: [{ x: 0, y: 0 }],
                }),
                interact.modifiers.restrict({
                    restriction: 'parent',
                    elementRect: { top: 0, left: 0, bottom: 1, right: 1 },
                    endOnly: false,
                }),
            ],
            inertia: false,
        })
        .on('dragstart', function (event) {
            isDragging = true;
            console.log('drag start');
        })
        .on('dragmove', function (event) {
            const $ship = $(event.target);
            const shipId = $ship.data('ship-id');
            const ship = findShipById(STORAGE.SHIPS as Ship[], shipId);

            console.log(Math.round(event.dx / cellSize), Math.round(event.dy / cellSize));

            if (ship) {
                let newRow = Math.round(event.dy / cellSize) + ship.startPosition?.row;
                let newCol = Math.round(event.dx / cellSize) + ship.startPosition?.col;

                updateShip(ship, { row: newRow, col: newCol });
                updateAllShipsOverlap(STORAGE.SHIPS as Ship[]);
                $ship.css({
                    gridRowStart: newRow + 1,
                    gridColumnStart: newCol + 1,
                    gridColumnEnd: ship.direction === Direction.HORIZONTAL ? `span ${ship.area}` : 'span 1',
                    gridRowEnd: ship.direction === Direction.VERTICAL ? `span ${ship.area}` : 'span 1',
                    top: '',
                    left: '',
                });
            }
        })
        .on('dragend', function (event) {
            const $ship = $(event.target);
            const shipId = $ship.data('ship-id');
            const ship = findShipById(STORAGE.SHIPS as Ship[], shipId);

            if ($ship.attr('data-overlapping') === 'true') {
                alert('Ships are still overlapping! Adjust the position.');
            }
            setTimeout(() => {
                isDragging = false;
            }, 500);
        });

    $('.ship').on('click', function (event) {
        if (isDragging) return;
        const $ship = $(event.currentTarget);
        const shipId = $ship.data('ship-id') as string;
        const cellSize = getCellSize();

        const ship = findShipById(STORAGE.SHIPS as Ship[], shipId);
        if (!ship) {
            console.error('Ship not found');
            return;
        }

        const shipOffset = $ship.offset();
        const clickX = event.pageX - shipOffset!.left;
        const clickY = event.pageY - shipOffset!.top;
        const clickIndex =
            ship.direction === Direction.HORIZONTAL ? Math.floor(clickX / cellSize) : Math.floor(clickY / cellSize);

        flipShip(ship, clickIndex, BOARD_SIZE);

        renderShipsOnBoard(STORAGE.SHIPS as Ship[], true);
        updateAllShipsOverlap(STORAGE.SHIPS as Ship[]);
        initShipsWithRotation();
    });
}

const bindEvents = () => {
    initShipsWithRotation();

    $('#start-btn').on('click', () => {
        const shipsState = STORAGE.SHIPS as Ship[];

        if (isBoardIllegal(shipsState)) {
            alert('Ships are still overlapping! Adjust the position.');
            return;
        }
        const shipsToSend: Position[][] = shipsState.map((ship) => convertShipToServerFormat(ship)) || [];
        emitEvent(EVENTS.PLAYER_READY, shipsToSend);
        $('.game-board').addClass('waiting');
        $('.game-message').removeClass('hide');
    });

    $('#random-btn').on('click', () => {
        placeShipsRandomly(STORAGE.SHIPS as Ship[], BOARD_SIZE);
        renderShipsOnBoard(STORAGE.SHIPS as Ship[], true);
        initShipsWithRotation();
    });

    $('#exit-btn').on('click', () => {
        emitEvent(EVENTS.LEAVE_DURING_SETUP, {});
        renderOpponentSelectionScreen();
    });

    onEvent(EVENTS.PLAYER_LEFT_DURING_SETUP, (data: any) => {
        console.log('player left during setup');
        renderFindOpponentScreen();
    });

    onEvent(EVENTS.PLAYER_READY, (data: any) => {
        $('.waiting-players').text(data?.readyCount);
    });

    onEvent(EVENTS.ALL_PLAYERS_READY, (data: any) => {
        console.log(data);
        renderGameScreen(data);
    });
};
