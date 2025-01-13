import $ from 'jquery';
import 'jquery-ui/ui/widgets/draggable';
import 'jquery-ui/ui/widgets/droppable';
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

let BOARD_SIZE: number;

export function renderSetupBoardScreen() {
    BOARD_SIZE = STORAGE.GAME_CONFIG.boardSize;
    STORAGE.SHIPS = STORAGE.SHIPS ?? defineShips(STORAGE.GAME_CONFIG.ships);
    !isAllShipsPlaced(STORAGE.SHIPS) && placeShipsRandomly(STORAGE.SHIPS, BOARD_SIZE);

    console.log(STORAGE.SHIPS);

    const boardMarkup = renderBoard();

    $(IDS.APP).html(`
        <div class="game-board">
            <h1>Arrange your ships</h1>
            <p>players ready:<span class="waiting-players">0</span>/<span class="total-players">${STORAGE.GAME_CONFIG.numOfPlayers}</span></p>
            <div class="board-container">
                <div class="cells-layer">${boardMarkup}</div>
                <div class="ship-layer"></div>
             </div>     
            <button id="start-btn">Start</button>
            <button id="random-btn">Random</button>
        </div>
        <div class="game-message hide">
            <p>waiting for opponent...</p>
        </div>
    `);
    renderShipsOnBoard(STORAGE.SHIPS, true);
    bindEvents();
}

function initShipsWithRotation() {
    const cellSize = getCellSize();
    $('.ship').draggable({
        containment: '.ship-layer',
        grid: [cellSize, cellSize],
        helper: 'original',
        scroll: false,

        drag: function (event, ui) {
            const $ship = $(event.target);
            const shipId = $ship.data('ship-id');
            const ship = findShipById(STORAGE.SHIPS as Ship[], shipId);

            if (ship) {
                const newPosition: Position = {
                    row: Math.round(ui.position.top / cellSize),
                    col: Math.round(ui.position.left / cellSize),
                };
                updateShip(ship, newPosition);
            }

            updateAllShipsOverlap(STORAGE.SHIPS as Ship[]);
        },

        stop: function (event, ui) {
            const $ship = $(event.target);

            if ($ship.attr('data-overlapping') === 'true') {
                alert('Ships are still overlapping! Adjust the position.');
            }
        },
    });

    $('.ship').on('click', function (event) {
        const $ship = $(event.currentTarget);
        const shipId = $ship.data('ship-id') as string;
        const cellSize = getCellSize();

        const shipState = STORAGE.SHIPS as Ship[];
        const ship: Ship | undefined = findShipById(shipState, shipId);
        if (!ship) {
            console.error('Ship not found');
            return;
        }

        const currentDirection = ship.direction;
        const newDirection = currentDirection === Direction.HORIZONTAL ? Direction.VERTICAL : Direction.HORIZONTAL;

        const shipOffset = $ship.offset();
        const clickX = event.pageX - shipOffset!.left;
        const clickY = event.pageY - shipOffset!.top;
        const clickIndex =
            currentDirection === Direction.HORIZONTAL ? Math.floor(clickX / cellSize) : Math.floor(clickY / cellSize);

        flipShip(ship, clickIndex, BOARD_SIZE);

        $ship.data('direction', newDirection);
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

    onEvent(EVENTS.PLAYER_READY, (data: any) => {
        console.log(data);
        $('.waiting-players').text(data);
    });

    onEvent(EVENTS.ALL_PLAYERS_READY, (data: any) => {
        console.log(data);
        renderGameScreen(data);
    });
};
