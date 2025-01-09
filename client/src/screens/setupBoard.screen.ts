import $ from 'jquery';
import 'jquery-ui/ui/widgets/draggable';
import 'jquery-ui/ui/widgets/droppable';
import { EVENTS, IDS } from '../utils/constants';
import STORAGE from '../utils/storage';
import { convertShipToServerFormat, defineShips, isAllShipsPlaced, placeShipsRandomly } from '../components/ship';
import { Direction, Ship } from '../interfaces/Ship';
import { Position } from '../interfaces/Position';
import { getCellSize, renderBoard, renderShipsOnBoard } from '../components/board';
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

        drag: function (event, ui) {},

        stop: function (event, ui) {},
    });

    $('.ship').on('click', function (event) {
        const $ship = $(event.currentTarget);
        const cellSize = getCellSize();
        const shipArea = parseInt($ship.data('area'));
        const currentDirection = $ship.data('direction');
        const shipId = $ship.data('ship-id') as string;
        const newDirection = currentDirection === Direction.HORIZONTAL ? Direction.VERTICAL : Direction.HORIZONTAL;

        const shipOffset = $ship.offset();
        const clickX = event.pageX - shipOffset!.left;
        const clickY = event.pageY - shipOffset!.top;
        const clickIndex =
            currentDirection === Direction.HORIZONTAL ? Math.floor(clickX / cellSize) : Math.floor(clickY / cellSize);

        const shipState = STORAGE.SHIPS as Ship[];
        const ship: Ship | undefined = shipState.find((ship) => ship.id === shipId);

        if (!ship) {
            console.error('Ship not found');
            return;
        }

        ship.direction = newDirection;
        const currRow = ship.startPosition?.row;
        const currCol = ship.startPosition?.col;

        let newRow: number;
        let newCol: number;

        if (currentDirection === Direction.VERTICAL) {
            newRow = Math.max(0, currRow + clickIndex);
            newCol = currCol - (shipArea - clickIndex - 1);
            newCol = Math.max(0, Math.min(newCol, BOARD_SIZE - shipArea));
        } else {
            newRow = Math.max(0, currRow - clickIndex);
            newCol = currCol + clickIndex;
            newRow = Math.max(0, Math.min(newRow, BOARD_SIZE - shipArea));
        }

        ship.startPosition = { row: newRow, col: newCol };

        $ship.data('direction', newDirection);
        renderShipsOnBoard(STORAGE.SHIPS as Ship[], true);
        initShipsWithRotation();
        // console.log(`prev placement: ${currentDirection}, New head at (${currRow}, ${currCol})`);
        // console.log(`new placement: ${newDirection}, New head at (${newRow}, ${newCol})`);
    });
}

const bindEvents = () => {
    initShipsWithRotation();

    $('#start-btn').on('click', () => {
        const shipsToSend: Position[][] = STORAGE?.SHIPS?.map((ship) => convertShipToServerFormat(ship)) || [];
        emitEvent(EVENTS.PLAYER_READY, shipsToSend);
        $('.game-board').addClass('waiting');
        $('.game-message').removeClass('hide');
        //renderGameScreen();
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
        renderGameScreen();
    });
};
