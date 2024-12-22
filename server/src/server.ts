import http from 'http';
import app from './app';
import { Server as SocketIoServer } from 'socket.io';
import setupSockets from './sockets/index';

const server = http.createServer(app);
const io = new SocketIoServer(server);
setupSockets(io);

server.listen(3000, () => console.log('listening on PORT:3000'));