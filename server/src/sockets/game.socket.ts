import { Server as SocketIOServer, Socket } from 'socket.io';
import { gameSettings, joinGame } from '../services/game.service';

export default function gameSocketHandler(io: SocketIOServer, socket: Socket) {

    socket.emit('availableSettings', gameSettings);

    socket.on('joinGame', (metadata) => {
        const gameId = joinGame(metadata);
        socket.join(gameId);
        io.to(gameId).emit('playerJoined', `שחקן הצטרף לחדר ${gameId}`);
    });

    socket.on('playerMove', (data) => {
        io.to(data.room).emit('updateBoard', data);
    });
}
