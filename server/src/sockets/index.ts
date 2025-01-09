import { Server as SocketIOServer, Socket } from 'socket.io';
import { serialize, parse } from 'cookie';

import gameSocketHandler from './game.socket';
import { getPlayerID } from '../services/game.service';

export default function setupSockets(io: SocketIOServer) {
    io.engine.on('initial_headers', (headers, request) => {
        const cookies = parse(request.headers.cookie || '');
        if (!cookies.token) {
            const cookie = serialize('token', generateUniqueToken(), {
                httpOnly: true,
                sameSite: 'none',
                secure: true,
                path: '/',
            });
            console.log('set cookie', cookie);
            headers['set-cookie'] = [cookie];
        } else {
            console.log('Existing token found:', cookies.token);
        }
    });

    io.on('connection', (socket: Socket) => {
        console.log(`a user connected, ${socket.id}`);
        console.log('cookie', parse(socket.handshake.headers.cookie || ''));

        jwtMW(socket);

        try {
            gameSocketHandler(io, socket);
        } catch (e) {
            console.error('failed on listen to socket events', e);
        }

        socket.on('disconnect', () => {
            console.log('user disconnected');
        });
    });
}

export const jwtMW = (socket: Socket) => {
    socket.onAny((event, metadata) => {
        try {
            const cookies = parse(socket.handshake.headers.cookie || '');
            const token = cookies.token;

            if (!token) {
                socket.emit('error', 'No token provided');
                return;
            }

            const playerID = getPlayerID(token);
            if (!playerID) {
                socket.emit('error', 'Invalid token');
                return;
            }
            socket.data.playerID = playerID;
        } catch (error) {
            socket.emit('error', 'Invalid token or error parsing token');
        }
    });
};

function generateUniqueToken(): string {
    return Math.random().toString(36).substr(2, 9);
}
