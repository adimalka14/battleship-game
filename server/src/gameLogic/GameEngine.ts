import { Player } from './player/Player';
import { GameData, GameState } from './GameState';
import { defaultGameConfig, GameConfig } from './GameConfig';
import { v4 as uuid_v4 } from 'uuid';

export class GameEngine {
    constructor(
        public readonly config: GameConfig = defaultGameConfig,
        public readonly players: Player[] = [],
        public readonly gameId: string = uuid_v4(),
        public gameState: GameState = GameState.WAITING_FOR_PLAYERS,
        public currentTurn: number = 0
    ) {}

    init() {
        this.gameState = GameState.IN_PROGRESS;
    }

    makeMove() {}

    addPlayer(player: Player): void {
        this.players.push(player);
    }

    removePlayer(player: Player): void {
        this.players.splice(this.players.indexOf(player), 1);
    }

    isFull(): boolean {
        return this.players.length === this.config.numOfPlayers || !this.config.isMultiplayer;
    }

    waitingPlayersCount(): number {
        return this.players.length;
    }

    totalPlayersCount(): number {
        return this.config.numOfPlayers;
    }

    getGameData(playerId: string): GameData {
        const player = this.players.find((player) => player.id === playerId);

        const playerData = {
            id: player?.id || '',
            name: player?.name || '',
            board: player?.getBoardForPlayer(this.config.boardSize),
            ships: player?.ships?.map((ship) => ({
                positions: ship.positions,
                hits: ship.hits,
            })),
        } as GameData['player'];

        const enemiesData = this.players
            .filter((p) => p.id !== playerId)
            .map((enemy) => ({
                name: enemy.name || '',
                board: enemy.getBoardForEnemy(this.config.boardSize),
            })) as GameData['enemies'];

        return {
            gameId: this.gameId,
            player: playerData,
            enemies: enemiesData,
            currentTurn: this.players[this.currentTurn]?.id,
            config: this.config,
            state: this.gameState,
            waitingPlayers: this.waitingPlayersCount(),
            totalPlayers: this.totalPlayersCount(),
        } as GameData;
    }

    private nextTurn() {
        this.currentTurn = (this.currentTurn + 1) % this.players.length;
    }
}
