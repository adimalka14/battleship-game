import { v4 as uuid_v4 } from 'uuid';

import { GameEngine } from '../gameLogic/GameEngine';
import { GameConfig, GameSettings } from '../gameLogic/GameConfig';
import { Player, PlayerStatus } from '../gameLogic/player/Player';
import { Ship } from '../gameLogic/ship/Ship';
import { Position } from '../gameLogic/board/Position';
import { GameData, GameState } from '../gameLogic/GameState';
import { AttackResult } from '../gameLogic/attack/Attack';

const games = new Map<string, GameEngine>();
const players = new Map<string, Player>();
const playerToGameId = new Map<string, string>();
const tokensToPlayers = new Map<string, string>();
const playersToSockets = new Map<string, string>();

const waitingGames = (): GameEngine[] => {
    return [...games.values()].filter((game) => game.gameState === GameState.WAITING_FOR_PLAYERS);
};

const activeGames = [...games.values()].filter((game) => game.gameState === GameState.IN_PROGRESS);

export const gameSettings = GameSettings;
export const setPlayerToSocket = (playerId: string, socketId: string) => playersToSockets.set(playerId, socketId);
export const getSocketID = (playerId: string) => playersToSockets.get(playerId);

export const getPlayerID = (token: string, createIfNotExist = false): string | null => {
    // if(!token) throw Error('missing token');

    const result = tokensToPlayers.get(token);
    if (result) return result;

    return createIfNotExist ? createPlayerID(token) : null;
};

const createPlayerID = (token: string): string => {
    const playerId = uuid_v4();
    tokensToPlayers.set(token, playerId);
    return playerId;
};

export const joinGame = (metadata: any): GameData => {
    const { playerQuery, gameConfig } = metadata;
    const player = getPlayer(playerQuery);
    const game = findAvailableGame(gameConfig as GameConfig);

    game.addPlayer(player);
    playerToGameId.set(player.id, game.gameId);

    if (game.isFull()) {
        game.gameState = GameState.SETTING_UP_BOARD;
    }

    return game.getGameData();
};

export const playerReady = (playerId: string, data: Position[][]): boolean => {
    const player = players.get(playerId);

    if (!player) return false;

    player.ships = data.map((positions) => new Ship(positions));
    player.status = PlayerStatus.WAITING;
    return true;
};

export const allPlayersReady = (gameId: string): { allReady: boolean; readyCount: number } => {
    const game = games.get(gameId);
    if (!game) return { allReady: false, readyCount: 0 };

    return game.allPlayersReady();
};

export const getAllGamePlayers = (gameId: string): string[] => {
    const game = games.get(gameId);

    return game ? game.players.map((player) => player.id) : [];
};

export const getGameData = (gameId: string, playerId: string | undefined = undefined): GameData => {
    const game = games.get(gameId);
    if (!game) return {} as GameData;
    return game.getGameData(playerId);
};

export const makeMove = (gameId: string, attackerId: string, attactedId: string, position: Position): AttackResult => {
    const game = games.get(gameId);

    if (!game) throw Error('game not found');

    if (game.playerIdTurn() !== attackerId) throw Error('not your turn');

    return game.makeMove(attactedId, position);
};

export const isGameFinished = (gameId: string): boolean => {
    const game = games.get(gameId);
    if (!game) throw Error('game not found');

    return game ? game.gameState === GameState.FINISHED : false;
};

export const deleteGame = (gameId: string): void => {
    const game = games.get(gameId);

    if (!game) return;

    game.players.forEach((player) => {
        player.reset();
        playerToGameId.delete(player.id);
    });

    games.delete(gameId);
};

export const userLeaveLobby = (playerId: string): void => {
    const gameId = playerToGameId.get(playerId);
    const game = games.get(gameId || '');
    const player = players.get(playerId);

    if (game && player) {
        game.removePlayer(player);
        player.status = PlayerStatus.CONNECTED;
    }
};

export const userLeaveDuringSetup = (playerId: string): void => {
    const gameId = playerToGameId.get(playerId);

    gameId && deleteGame(gameId);
};

export const userLeaveGame = (playerId: string): void => {
    const game = games.get(playerToGameId.get(playerId) || '');
    const player = players.get(playerId);

    game?.playerRetired(playerId);
    playerToGameId.delete(playerId);
    player?.reset();
};

export const userDisconnect = (playerId: string): void => {
    const gameId = playerToGameId.get(playerId);
    const player = players.get(playerId);
    if (!player || !gameId) return;

    const game = games.get(gameId);
    if (!game) return;

    player.status = PlayerStatus.DISCONNECTED;

    if (game.gameState === GameState.IN_PROGRESS) {
        // todo : implement option to reconnect and back to game
    }
};

function getPlayer(playerQuery: any): Player {
    const id = playerQuery.id;

    if (players.has(id)) {
        return players.get(id)!;
    }

    const newPlayer = new Player(id, playerQuery.name, false);

    players.set(id, newPlayer);

    return newPlayer;
}

function findAvailableGame(config: GameConfig): GameEngine {
    let game = waitingGames().find((game) => JSON.stringify(game.config) === JSON.stringify(config));

    if (game === undefined) {
        game = new GameEngine(config);
        games.set(game.gameId, game);
    }

    return game;
}
