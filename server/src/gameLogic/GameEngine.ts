import { Player, PlayerStatus } from './player/Player';
import { GameData, GameState } from './GameState';
import { Position } from './board/Position';
import { defaultGameConfig, GameConfig } from './GameConfig';
import { v4 as uuid_v4 } from 'uuid';
import { AttackResult, AttackState, AttackType } from './attack/Attack';

export class GameEngine {
    constructor(
        private readonly _config: GameConfig = defaultGameConfig,
        private readonly _gameId: string = uuid_v4(),
        private _gameState: GameState = GameState.WAITING_FOR_PLAYERS,
        public readonly players: Player[] = [],
        public currentTurn: number = 0
    ) {}

    get config(): GameConfig {
        return this._config;
    }

    get gameId(): string {
        return this._gameId;
    }

    get gameState(): GameState {
        return this._gameState;
    }

    set gameState(state: GameState) {
        this._gameState = state;
    }

    init() {
        this._gameState = GameState.IN_PROGRESS;
    }

    makeMove(attackerId: string, attackedId: string, positions: Position[]): AttackResult {
        const player = this.players.find((player) => player.id === attackedId);
        if (!player) throw Error('player not found');

        const states = player.beingAttacked(positions);

        if (states.some((state) => state === AttackState.MISS)) {
            this.nextTurn();
        }

        this.updateIfWin();

        return {
            type: AttackType.REGULAR,
            states,
            positions,
            attackerId,
            attackedId,
        };
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

    allPlayersReady(): { allReady: boolean; readyCount: number } {
        const readyCount = this.players.filter((player) => player.status === PlayerStatus.WAITING).length;
        const allReady = readyCount === this.players.length;

        if (allReady) {
            this.players.forEach((player) => {
                player.status = PlayerStatus.PLAYING;
            });
            this.gameState = GameState.IN_PROGRESS;
        }

        return { allReady, readyCount };
    }

    waitingPlayersCount(): number {
        return this.players.length;
    }

    totalPlayersCount(): number {
        return this.config.numOfPlayers;
    }

    playerRetired(playerId: string): void {
        const playerIndex = this.players.findIndex((player) => player.id === playerId);
        const player = this.players[playerIndex];
        const clone = player.clone();

        if (clone) this.players[playerIndex] = clone;
        if (this.currentTurn === playerIndex) this.nextTurn();
        this.updateIfWin();
    }

    getGameData(playerId: string | undefined = undefined): GameData {
        if (playerId === undefined)
            return {
                gameId: this.gameId,
                config: this.config,
                state: this._gameState,
                waitingPlayers: this.waitingPlayersCount(),
                totalPlayers: this.totalPlayersCount(),
            } as GameData;

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
            state: this._gameState,
            waitingPlayers: this.waitingPlayersCount(),
            totalPlayers: this.totalPlayersCount(),
        } as GameData;
    }

    playerIdTurn(): string {
        return this.players[this.currentTurn]?.id || '';
    }

    private nextTurn() {
        for (let i = 1; i <= this.players.length; i++) {
            const nextTurn: number = (this.currentTurn + i) % this.players.length;
            const nextPlayer = this.players[nextTurn];

            if (nextPlayer.status !== PlayerStatus.RETIRED && nextPlayer.status !== PlayerStatus.LOOSER) {
                this.currentTurn = nextTurn;
                break;
            }
        }
    }

    private updateIfWin() {
        const stillPlaying: Player[] = this.players.filter(
            (p) => !(p.status === PlayerStatus.LOOSER || p.status === PlayerStatus.RETIRED)
        );

        if (stillPlaying.length === 1) {
            stillPlaying[0].status = PlayerStatus.WINNER;
            this._gameState = GameState.FINISHED;
            this.currentTurn = -1;
        }
    }
}
