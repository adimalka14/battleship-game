import { Server as SocketIOServer, Socket } from 'socket.io';
import gameSocketHandler from './game.socket';

export default function setupSockets(io: SocketIOServer) {
    io.on('connection', (socket:Socket) =>{
        console.log('a user connected');

        gameSocketHandler(io, socket);

        socket.on('disconnect', () => {
            console.log('user disconnected');
        });
    });
}