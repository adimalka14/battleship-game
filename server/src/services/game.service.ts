import { GameEngine } from "../gameLogic/GameEngine";
import { GameSettings } from "../gameLogic/GameConfig";
import { GameConfig } from '../gameLogic/GameConfig';
import { Player } from '../gameLogic/player/Player';
import { v4 as uuid_v4 } from "uuid";

const activeGames = new Map<string, GameEngine>();
const waitingGames: GameEngine[] = [];
const players = new Map<string, Player>();

export const gameSettings = GameSettings

export const joinGame = (metadata):string => {
    const { playerQuery, gameConfig } = metadata;
    const player = getPlayer(playerQuery);
    const game = findAvailableGame(gameConfig as GameConfig);

    game.addPlayer(player);

    if(game.isFull()){
        activeGames.set(game.gameId, game);
        waitingGames.splice(waitingGames.indexOf(game), 1);
        game.init();
    }

    return game.gameId;
}

function getPlayer(playerQuery) : Player {
    const id = playerQuery.id || uuid_v4();

    if (players.has(id)) {
        const player = players.get(id)!;
        player.board = playerQuery.board;
        return player;
    }

    const name = playerQuery.name;
    const isComputer =  false;
    const board = playerQuery.board;

    const newPlayer = new Player(
        id,
        name,
        isComputer,
        board,
    );

    players.set(id, newPlayer);

    return newPlayer;
}

function findAvailableGame(config: GameConfig): GameEngine {
    let game = waitingGames.find(game =>
        JSON.stringify(game.config) === JSON.stringify(config));

    if(game === undefined){
        game = new GameEngine(config);
        waitingGames.push(game);
    }

    return game;
}