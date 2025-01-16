import $ from 'jquery';
import { IDS } from '../utils/constants';
import { emitEvent, onEvent } from '../utils/socket';
import { EVENTS } from '../utils/constants';
import STORAGE from '../utils/storage';
import { renderSetupBoardScreen } from './setupBoard.screen';
import { renderOpponentSelectionScreen } from './opponentSelection.screen';

export const renderFindOpponentScreen = () => {
    $(IDS.APP).html(`
        <button id="back-btn">Back</button>
        <p>Looking for an opponent...</p>
        <p><span class="waiting-players"></span>/<span class="total-players"></span></p>
    `);

    bindEvents();
};

const bindEvents = () => {
    $(`#back-btn`).on('click', () => {
        emitEvent(EVENTS.LEAVE_LOBBY, {});
        renderOpponentSelectionScreen();
    });

    onEvent(EVENTS.PLAYER_LEFT_LOBBY, (data: any) => {
        console.log(data);
        updatePlayersNumber(data.waitingPlayers, data.totalPlayers);
    });

    emitEvent(EVENTS.JOIN_GAME, {
        playerQuery: {
            name: STORAGE.USERNAME,
        },
        gameConfig: STORAGE.GAME_CONFIG,
    });

    onEvent(EVENTS.PLAYER_JOINED, (data: any) => {
        console.log(data);
        updatePlayersNumber(data.waitingPlayers, data.totalPlayers);
        if (data.state === 'SETTING_UP_BOARD') {
            renderSetupBoardScreen();
        }
    });
};

const updatePlayersNumber = (waitingPlayers: number, totalPlayers: number) => {
    $(`.waiting-players`).text(waitingPlayers);
    $(`.total-players`).text(totalPlayers);
};
