import { Server as SocketIOServer, Socket } from 'socket.io';
import {
    gameSettings,
    joinGame,
    setPlayerToSocket,
    getPlayerID,
    playerReady,
    allPlayersReady,
    getGameData,
    makeMove,
} from '../services/game.service';
import { GameData } from '../gameLogic/GameState';
import { parse } from 'cookie';

export default function gameSocketHandler(io: SocketIOServer, socket: Socket) {
    getPlayerID(parse(socket.handshake.headers.cookie || '').token, true);
    setPlayerToSocket(socket.data.playerID as string, socket.id);

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
        playerReady(socket.data.playerID as string, data);
        const { allReady, readyCount } = allPlayersReady(gameID);
        allReady
            ? io.to(gameID).emit('allPlayersReady', 'all players are ready')
            : io.to(gameID).emit('playerReady', readyCount);
    });

    socket.on('getGameData', () => {
        const gameData = getGameData(gameID, socket.data.playerID as string);
        socket.emit('updateBoard', gameData);
    });

    socket.on('playerShoot', (data) => {
        try {
            const playerId = socket.data.playerID as string;
            const attackResult = makeMove(gameID, playerId, data.playerBeingAttacked, data.position);
            console.log(attackResult);
            io.to(gameID).emit('attackResult', attackResult);
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
