import http from 'http';
import app from './app';
import { Server as SocketIoServer } from 'socket.io';
import setupSockets from './sockets/index';
import { PORT, UI_URL } from './utils/env';

const server = http.createServer(app);
const io = new SocketIoServer(server,
    { cors: { origin: UI_URL, methods: ['GET', 'POST'] } });
setupSockets(io);

server.listen(PORT, () => console.log('listening on PORT:3000'));