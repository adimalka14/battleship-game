import {
    NumberOfPlayers,
    TimeLimitForTurn,
    BoardSize,
} from './consts';
import { ShipConfig, ShipsConfigurations, ShipsConfigAlternatives} from './ship/shipConfig';

export interface GameConfig {
    boardSize: BoardSize;
    timeLimit: TimeLimitForTurn;
    numOfPlayers: NumberOfPlayers;
    ships : ShipConfig[];
    isMultiplayer: boolean;
}

export const defaultGameConfig: GameConfig = {
    boardSize: BoardSize.TEN,
    timeLimit: TimeLimitForTurn.THIRTY_SEC,
    numOfPlayers: NumberOfPlayers.TWO,
    ships: ShipsConfigurations[ShipsConfigAlternatives.DEFAULT],
    isMultiplayer: false,
}

export const GameSettings = {
    boardSizes: Object.values(BoardSize),
    timeLimits: Object.values(TimeLimitForTurn),
    numberOfPlayers: Object.values(NumberOfPlayers),
    shipsConfigurations: ShipsConfigurations,
    isMultiplayer: [true, false],
    defaultConfig: defaultGameConfig,
};