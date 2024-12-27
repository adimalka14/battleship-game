import $ from 'jquery';
import { IDS } from '../utils/constants';
import { emitEvent, onEvent } from '../utils/socket';
import { EVENTS } from '../utils/constants';
import STORAGE from '../utils/storage';
import { renderSetupBoardScreen } from './setupBoard.screen';

export const renderFindOpponentScreen = () => {
    $(IDS.APP).html(`
        <p>Looking for an opponent...</p>
        <p><span class="waiting-players"></span>/<span class="total-players"></span></p>
    `);

    bindEvents();
};

const bindEvents = () => {
    emitEvent(EVENTS.JOIN_GAME, {
        playerQuery: {
            name: localStorage.getItem('username'),
        },
        gameConfig: STORAGE.gameConfig,
    });

    onEvent(EVENTS.PLAYER_JOINED, (data: any) => {
        console.log(data);
        updatePlayersNumber(data.waitingPlayers, data.totalPlayers);
        if (data.state === 1) {
            renderSetupBoardScreen();
        }
    });
};

const updatePlayersNumber = (waitingPlayers: number, totalPlayers: number) => {
    $(`.waiting-players`).text(waitingPlayers);
    $(`.total-players`).text(totalPlayers);
};
