import http from 'http';
import app from './app';
import { Server as SocketIoServer } from 'socket.io';
import setupSockets from './sockets/index';
import { PORT, UI_URL } from './utils/env';
import logger from './utils/logger';

const server = http.createServer(app);
const options = {
    cors: { origin: UI_URL, methods: ['GET', 'POST'], credentials: true },
    path: '/socket.io',
};
const io = new SocketIoServer(server, options);

setupSockets(io);

try {
    server.listen(PORT, () =>
        logger.info('SYSTEM', 'Server started', {
            url: `${PORT}`,
        })
    );
} catch (error) {
    logger.error('SYSTEM', 'Server failed to start', {
        error,
    });
}
