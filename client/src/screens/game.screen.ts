import $ from 'jquery';
import { IDS, EVENTS } from '../utils/constants';
import { emitEvent, onEvent } from '../utils/socket';

export function renderGameScreen() {
    $(IDS.APP).html(`
        <div class="game-board">
            gamePage         
        </div>`);

    emitEvent(EVENTS.GET_GAME_DATA, {});

    onEvent(EVENTS.GAME_DATA, (data: any) => {
        console.log(data);
    });
}
