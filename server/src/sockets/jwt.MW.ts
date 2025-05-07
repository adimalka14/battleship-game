import { Socket } from 'socket.io';
import { parse } from 'cookie';
import { verifyAccessToken } from '../utils/token';

export const jwtMW = (socket: Socket) => {
    const cookies = parse(socket.handshake.headers.cookie || '');
    const token = cookies.accessToken as string;

    if (!token) {
        throw new Error('Authentication failed: No token provided');
    }

    const { id: playerId, username } = verifyAccessToken(token);

    if (!playerId) {
        throw new Error('Authentication failed: Invalid token');
    }

    socket.data.playerID = playerId;
    socket.data.username = username;
};
