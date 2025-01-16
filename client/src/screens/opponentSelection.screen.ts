import $ from 'jquery';
import { IDS } from '../utils/constants';
import { connectSocket, emitEvent, onEvent } from '../utils/socket';
import { EVENTS } from '../utils/constants';
import { renderFindOpponentScreen } from './findOpponent.screen';
import STORAGE from '../utils/storage';

const computerBtn = 'computer';
const computerBtnID = `#${computerBtn}`;
const playerBtn = 'player';
const playerBtnID = `#${playerBtn}`;

export const renderOpponentSelectionScreen = () => {
    $(IDS.APP).html(`
        <h1>Choose your opponent</h1>
        <button id=${playerBtn}><VS>VS Player</button>
    `);
    bindEvents();
};

const bindEvents = () => {
    // $(computerBtnID).on('click', () => joinGame(false));

    $(playerBtnID).on('click', () => joinGame(true));

    emitEvent(EVENTS.CLIENT_CONNECTED, {});

    onEvent(EVENTS.AVAILABLE_SETTINGS, (data: any) => {
        console.log('availableSettings', data);
        STORAGE.GAME_CONFIG = data.defaultConfig;
    });
};

const joinGame = (isMultiplayer: boolean): void => {
    try {
        STORAGE.GAME_CONFIG['isMultiplayer'] = isMultiplayer;
    } catch (error) {
        console.log(error);
    }

    console.log(STORAGE.GAME_CONFIG);

    renderFindOpponentScreen();
};
