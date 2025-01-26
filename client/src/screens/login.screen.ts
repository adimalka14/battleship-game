import $ from 'jquery';
import { EVENTS, IDS } from '../utils/constants';
import { connectSocket, emitEvent, onEvent } from '../utils/socket';
import { renderOpponentSelectionScreen } from './opponentSelection.screen';
import STORAGE from '../utils/storage';
import { SERVER_URL } from '../utils/env';

const startBtn = 'start-btn';
const startBtnID = `#${startBtn}`;

export const renderLoginScreen = () => {
    $(IDS.APP).html(`
        <h1>Battleship</h1>
        <p class="message">Please enter your username</p>
        <input type="text" id="username" placeholder="username">
        <button id="start-btn" class="btn">Start</button>
    `);

    bindEvents();
};

const bindEvents = () => {
    $(startBtnID).on('click', async () => {
        STORAGE.USERNAME = $(`#username`).val() as string;

        sendPostRequest('/auth/login', { username: STORAGE.USERNAME })
            .then(() => {
                connectSocket();
                renderOpponentSelectionScreen();
            })
            .catch((e) => console.log(e));

        onEvent('error', (data: any) => {
            console.log(data);
        });
    });
};

async function sendPostRequest(route: string, data: any) {
    const response = await fetch(`${SERVER_URL}${route}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        throw new Error(`Failed to send request ${response.statusText}`);
    }

    console.log(response);
}
