import { GameEngine } from '../gameLogic/GameEngine';
import { GameSettings } from '../gameLogic/GameConfig';
import { GameConfig } from '../gameLogic/GameConfig';
import { Player } from '../gameLogic/player/Player';
import { Ship } from '../gameLogic/ship/Ship';
import { Position } from '../gameLogic/board/Position';
import { v4 as uuid_v4 } from 'uuid';
import { GameData, GameState } from '../gameLogic/GameState';

const activeGames = new Map<string, GameEngine>();
const waitingGames: GameEngine[] = [];
const players = new Map<string, Player>();
const playerToGameId = new Map<string, string>();
const tokensToPlayers = new Map<string, string>();
const playersToSockets = new Map<string, string>();

export const gameSettings = GameSettings;

export const getPlayerID = (token: string, createIfNotExist = false): string | null => {
    // if(!token) throw Error('missing token');

    const result = tokensToPlayers.get(token);
    if (result) return result;

    return createIfNotExist ? createPlayerID(token) : null;
};

export const createPlayerID = (token: string): string => {
    const playerId = uuid_v4();
    tokensToPlayers.set(token, playerId);
    return playerId;
};

export const setPlayerToSocket = (playerId: string, socketId: string) => playersToSockets.set(playerId, socketId);

export const joinGame = (metadata: any): GameData => {
    const { playerQuery, gameConfig } = metadata;
    const player = getPlayer(playerQuery);
    const game = findAvailableGame(gameConfig as GameConfig);

    game.addPlayer(player);

    if (game.isFull()) {
        activeGames.set(game.gameId, game);
        waitingGames.splice(waitingGames.indexOf(game), 1);
        game.init();
    }

    return game.getGameData(player.id);
};

export const playerReady = (playerId: string, data: Position[][]): boolean => {
    const player = players.get(playerId);

    if (!player) return false;

    player.ships = data.map((positions) => new Ship(positions));
    player.isReady = true;
    return true;
};

export const allPlayersReady = (gameId: string): { allReady: boolean; readyCount: number } => {
    const game = activeGames.get(gameId);
    if (!game) return { allReady: false, readyCount: 0 };

    const readyCount = game.players.filter((player) => player.isReady).length;
    const allReady = readyCount === game.players.length;

    return { allReady, readyCount };
};

export const getGameData = (gameId: string, playerId: string): GameData => {
    const game = activeGames.get(gameId);
    if (!game) return {} as GameData;
    return game.getGameData(playerId);
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
    let game = waitingGames.find((game) => JSON.stringify(game.config) === JSON.stringify(config));

    if (game === undefined) {
        game = new GameEngine(config);
        waitingGames.push(game);
    }

    return game;
}
