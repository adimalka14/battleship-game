import { Server as SocketIOServer, Socket } from 'socket.io';
import {
    gameSettings,
    joinGame,
    setPlayerToSocket,
    playerReady,
    allPlayersReady,
    getGameData,
    makeMove,
    getAllGamePlayers,
    getSocketID,
    isGameFinished,
    deleteGame,
} from '../services/game.service';
import { GameData } from '../gameLogic/GameState';
import { parse } from 'cookie';

export default function gameSocketHandler(io: SocketIOServer, socket: Socket) {
    // getPlayerID(parse(socket.handshake.headers.cookie || '').token, true);
    setPlayerToSocket(socket.data.playerID as string, socket.id);
    console.log('playerID', socket.data.playerID as string, 'socketId', socket.id);

    let gameID: string;

    socket.on('clientConnected', () => {
        socket.emit('availableSettings', gameSettings);
    });

    socket.on('joinGame', (metadata) => {
        metadata.playerQuery.id = socket.data.playerID as string;
        const gameData: GameData = joinGame(metadata);
        const { gameId } = gameData;
        gameID = gameId;
        socket.join(gameId);
        io.to(gameId).emit('playerJoined', gameData);
    });

    socket.on('playerReady', (data: any) => {
        // todo: check validations before emit
        const playerId = socket.data.playerID as string;
        playerReady(playerId, data);
        const { allReady, readyCount } = allPlayersReady(gameID);
        if (allReady) {
            const playersIds: string[] = getAllGamePlayers(gameID);
            console.log(playersIds);
            playersIds.forEach((playerId) => {
                const socketId = getSocketID(playerId);
                const gameData = getGameData(gameID, playerId);

                socketId && io.to(socketId).emit('allPlayersReady', { gameData });
            });
        } else {
            io.to(gameID).emit('playerReady', readyCount);
        }
    });

    socket.on('getGameData', () => {
        const gameData = getGameData(gameID, socket.data.playerID as string);

        socket.emit('updateBoard', { gameData });
    });

    socket.on('playerShoot', (data) => {
        try {
            const playerId = socket.data.playerID as string;
            const attackResult = makeMove(gameID, playerId, data.playerBeingAttacked, data.position);
            const playersIds: string[] = getAllGamePlayers(gameID);
            const gameFinished = isGameFinished(gameID);

            playersIds.forEach((playerId) => {
                const socketId = getSocketID(playerId);
                const gameData = getGameData(gameID, playerId);
                if (gameFinished) {
                    socketId && io.to(socketId).emit('gameFinished', { gameData, attackResult });
                } else {
                    socketId && io.to(socketId).emit('updateBoard', { gameData, attackResult });
                }
            });

            if (gameFinished) {
                deleteGame(gameID);
            }
        } catch (e) {
            console.error(e);
        }
    });
}

function getCookieValue(cookie: string | undefined, key: string): string | undefined {
    if (!cookie) return undefined;
    const match = cookie.split('; ').find((c) => c.startsWith(`${key}=`));
    return match ? match.split('=')[1] : undefined;
}
