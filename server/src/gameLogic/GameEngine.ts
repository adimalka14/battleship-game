import { Player } from "./player/Player";
import { GameData, GameState } from './GameState';
import { defaultGameConfig, GameConfig } from './GameConfig';
import { v4 as uuid_v4 } from "uuid";

export class GameEngine {
    constructor(
        public readonly config: GameConfig = defaultGameConfig,
        public readonly players: Player[] = [],
        public readonly gameId: string = uuid_v4(),
        public gameState: GameState = GameState.WAITING_FOR_PLAYERS,
        public currentTurn: number = 0,
    ) {}

    init() {
        this.gameState = GameState.IN_PROGRESS;
    }

    makeMove() {

    }

    addPlayer(player: Player) : void {
        this.players.push(player);
    }

    removePlayer(player: Player) : void {
        this.players.splice(this.players.indexOf(player), 1);
    }

    isFull() : boolean {
        return this.players.length === this.config.numOfPlayers ||
            !this.config.isMultiplayer;
    }

    getGameData() {
        return JSON.parse(JSON.stringify(this));
    }

    private nextTurn() {
        this.currentTurn = (this.currentTurn + 1) % this.players.length;
    }
}