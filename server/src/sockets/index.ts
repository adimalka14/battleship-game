import { Server as SocketIOServer, Socket } from 'socket.io';
import gameSocketHandler from './game.socket';
import { jwtMW } from './jwt.MW';
import logger from '../utils/logger';

export default function setupSockets(io: SocketIOServer) {
    io.use((socket, next) => authMW(socket, next));

    io.on('connection', (socket: Socket) => {
        logger.info(socket.id, 'User connected', { playerID: socket.data?.playerID });

        try {
            gameSocketHandler(io, socket);
        } catch (error) {
            logger.error(socket.id, 'Failed to initialize game socket handler', { error });
        }

        socket.on('disconnect', () => {
            logger.info(socket.id, 'User disconnected', { playerID: socket.data?.playerID });
        });
    });
}

function authMW(socket: Socket, next: (err?: Error) => void) {
    try {
        jwtMW(socket);
        next();
    } catch (error: unknown) {
        if (error instanceof Error) {
            logger.error(socket.id, 'Error processing token', { message: error.message });
            next(error as Error);
        }
    }
}
