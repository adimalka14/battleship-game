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

    waitingPlayersCount(): number {
        return this.players.length;
    }

    totalPlayersCount(): number {
        return this.config.numOfPlayers;
    }

    getGameData(): GameData {
        return {
            gameId: this.gameId,
            players: this.players.map(player => ({
                id: player.id,
                name: player.name,
                board: player.board?.grid,
                ships: player.board?.ships?.map(ship => ({
                    positions: ship.positions,
                    hits: ship.hits,
                })),
            })),
            currentTurn: this.players[this.currentTurn]?.id,
            config: this.config,
            state: this.gameState,
            waitingPlayers: this.waitingPlayersCount(),
            totalPlayers: this.totalPlayersCount(),
        };
    }

    private nextTurn() {
        this.currentTurn = (this.currentTurn + 1) % this.players.length;
    }
}