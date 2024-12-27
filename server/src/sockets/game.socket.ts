import { Server as SocketIOServer, Socket } from 'socket.io';
import { gameSettings, joinGame } from '../services/game.service';
import { GameData } from '../gameLogic/GameState';

export default function gameSocketHandler(io: SocketIOServer, socket: Socket) {

    socket.on('clientConnected', () => {
        socket.emit('availableSettings', gameSettings);
    });

    socket.on('joinGame', (metadata) => {
        const gameData : GameData = joinGame(metadata);
        const { gameId } = gameData;
        socket.join(gameId);
        io.to(gameId).emit('playerJoined', gameData);
    });

    socket.on('playerMove', (data) => {
        io.to(data.room).emit('updateBoard', data);
    });
}

