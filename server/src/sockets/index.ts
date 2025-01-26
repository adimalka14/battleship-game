import { Server as SocketIOServer, Socket } from 'socket.io';
import gameSocketHandler from './game.socket';
import { jwtMW } from './jwt.MW';

export default function setupSockets(io: SocketIOServer) {
    io.use((socket, next) => authMW(socket, next));

    io.on('connection', (socket: Socket) => {
        console.log(`User connected: ${socket.id}`);
        console.log('Player ID:', socket.data.playerID);

        try {
            gameSocketHandler(io, socket);
        } catch (error) {
            console.error('Failed to initialize game socket handler:', error);
        }

        socket.on('disconnect', () => {});
    });
}

function authMW(socket: Socket, next: (err?: Error) => void) {
    try {
        jwtMW(socket);
        next();
    } catch (error: unknown) {
        if (error instanceof Error) {
            console.error('Error processing token:', error?.message);
            next(error as Error);
        }
    }
}
