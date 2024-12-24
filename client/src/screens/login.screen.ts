import $ from 'jquery';
import { IDS } from '../utils/constants';
import { connectSocket } from '../utils/socket';
import { renderOpponentSelectionScreen } from './opponentSelection.screen';
import storage from '../utils/storage';

const startBtn = 'start-btn';
const startBtnID = `#${startBtn}`;

export const renderLoginScreen = () => {
    $(IDS.APP).html(`
        <h1>Battleship</h1>
        <input type="text" id="username" placeholder="username">
        <button id="start-btn">Start</button>
    `);

    bindEvents();
};

const bindEvents = () => {
    $(startBtnID).on('click', () => {
        storage.username = $(`#username`).val() as string;
        connectSocket();
        renderOpponentSelectionScreen();
    });
};
