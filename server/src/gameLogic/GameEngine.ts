import { Player, PlayerStatus } from './player/Player';
import { GameData, GameState } from './GameState';
import { Position } from './board/Position';
import { defaultGameConfig, GameConfig } from './GameConfig';
import { v4 as uuid_v4 } from 'uuid';
import { AttackResult } from './attack/Attack';

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

    makeMove(playerId: string, position: Position): AttackResult {
        const player = this.players.find((player) => player.id === playerId);
        if (!player) throw Error('player not found');

        const result = player.beingAttacked(position);

        if (result === AttackResult.MISS) {
            this.nextTurn();
        }

        this.updateIfWin();

        return result;
    }

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
            status: player?.status,
            board: player?.getBoard(this.config.boardSize, true),
            ships: player?.ships?.map((ship) => ({
                positions: ship.positions,
                hits: ship.hits,
            })),
        } as GameData['player'];

        const enemiesData = this.players
            .filter((p) => p.id !== playerId)
            .map((enemy) => ({
                id: enemy.id,
                name: enemy.name || '',
                status: enemy.status,
                board: enemy.getBoard(this.config.boardSize, false),
                sunkShips: enemy.ships?.filter((ship) => ship.isSunk()).map((ship) => ship.positions),
            })) as GameData['enemies'];

        return {
            gameId: this.gameId,
            player: playerData,
            enemies: enemiesData,
            currentTurn: this.playerIdTurn(),
            config: this.config,
            state: this.gameState,
            waitingPlayers: this.waitingPlayersCount(),
            totalPlayers: this.totalPlayersCount(),
        } as GameData;
    }

    playerIdTurn(): string {
        return this.players[this.currentTurn]?.id || '';
    }

    private nextTurn() {
        this.currentTurn = (this.currentTurn + 1) % this.players.length;
    }

    private updateIfWin() {
        const stillPlaying: Player[] = this.players.filter(
            (p) => !(p.status === PlayerStatus.LOOSER || p.status === PlayerStatus.RETIRED)
        );

        if (stillPlaying.length === 1) {
            stillPlaying[0].status = PlayerStatus.WINNER;
            this.gameState = GameState.FINISHED;
            this.currentTurn = -1;
        }
    }
}
