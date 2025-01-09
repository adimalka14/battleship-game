import http from 'http';
import app from './app';
import { Server as SocketIoServer } from 'socket.io';
import setupSockets from './sockets/index';
import { PORT, UI_URL } from './utils/env';

const server = http.createServer(app);
const options = {
    // cookie: true,
    cors: { origin: UI_URL, methods: ['GET', 'POST'], credentials: true },
};
console.log('io options', options);
const io = new SocketIoServer(server, options);

setupSockets(io);

server.listen(PORT, () => console.log('listening on PORT:3000'));
