import { Player } from "./player/Player";
import { GameState } from './GameState';
import { defaultGameConfig, GameConfig } from './GameConfig';
import { v4 as uuid_v4 } from "uuid";

export class GameEngine {
    constructor(
        public readonly players: Player[] = [],
        public readonly gameId: string = uuid_v4(),
        public readonly config: GameConfig = defaultGameConfig,
        public state: GameState,
        public currentTurn: string,
    ) {}

    init() {

    }

    makeMove() {

    }

    private nextTurn() {

    }
}