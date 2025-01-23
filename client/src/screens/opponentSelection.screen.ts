import $ from 'jquery';
import { IDS } from '../utils/constants';
import { emitEvent, onEvent } from '../utils/socket';
import { EVENTS } from '../utils/constants';
import { renderFindOpponentScreen } from './findOpponent.screen';
import STORAGE from '../utils/storage';

const computerBtn = 'computer-btn menu';
const computerBtnID = `#${computerBtn}`;
const playerBtn = 'btn.player.menu';
const playerBtnID = `#${playerBtn}`;

export const renderOpponentSelectionScreen = () => {
    $(IDS.APP).html(`
        <h1>Battleship</h1>
        <p class="message">Choose your opponent</p>
        <div id="player-btn" class="btn player menu">VS Player</div>
    `);
    bindEvents();
};

const bindEvents = () => {
    $('#player-btn').on('click', () => joinGame(true));

    emitEvent(EVENTS.CLIENT_CONNECTED, {});

    onEvent(EVENTS.AVAILABLE_SETTINGS, (data: any) => {
        STORAGE.GAME_CONFIG = data.defaultConfig;
    });
};

const joinGame = (isMultiplayer: boolean): void => {
    try {
        STORAGE.GAME_CONFIG['isMultiplayer'] = isMultiplayer;
    } catch (error) {
        console.log(error);
    }

    renderFindOpponentScreen();
};
