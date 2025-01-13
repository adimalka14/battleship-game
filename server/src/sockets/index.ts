import { Server as SocketIOServer, Socket } from 'socket.io';
import { serialize, parse } from 'cookie';
import gameSocketHandler from './game.socket';
import { getPlayerID } from '../services/game.service';

export default function setupSockets(io: SocketIOServer) {
    io.engine.on('initial_headers', (headers, req) => cookiesSetup(headers, req));
    io.use((socket, next) => jwtMW(socket, next));

    io.on('connection', (socket: Socket) => {
        console.log(`User connected: ${socket.id}`);
        console.log('Player ID:', socket.data.playerID);

        try {
            gameSocketHandler(io, socket);
        } catch (error) {
            console.error('Failed to initialize game socket handler:', error);
        }

        socket.on('disconnect', () => {
            console.log('User disconnected:', socket.id);
        });
    });
}

function cookiesSetup(headers: any, req: any) {
    const cookies = parse(req.headers.cookie || '');
    if (!cookies.token) {
        const token = generateUniqueToken();
        const cookie = serialize('token', token, {
            httpOnly: true,
            sameSite: 'none',
            secure: true,
            path: '/',
        });
        headers['set-cookie'] = [cookie];
        console.log('New token set:', cookie);
    } else {
        console.log('Existing token:', cookies.token);
    }
}

function jwtMW(socket: Socket, next: (err?: Error) => void) {
    try {
        const cookies = parse(socket.handshake.headers.cookie || '');
        const token = cookies.token;

        if (!token) {
            console.error('No token provided');
            return next(new Error('Authentication failed: No token provided'));
        }

        const playerID = getPlayerID(token, true);
        if (!playerID) {
            console.error('Invalid token');
            return next(new Error('Authentication failed: Invalid token'));
        }

        socket.data.playerID = playerID;
        next();
    } catch (error) {
        console.error('Error processing token:', error);
        next(new Error('Authentication failed: Error processing token'));
    }
}

function generateUniqueToken(): string {
    return Math.random().toString(36).substr(2, 9);
}

// ✅ Middleware להגדרת קוקי אם חסר
// const cookiesSetup = (headers, request) => {
//     const cookies = parse(request.headers.cookie || '');
//     if (!cookies.token) {
//         const token = generateUniqueToken(); // יצירת טוקן ייחודי
//         const cookie = serialize('token', token, {
//             httpOnly: true,
//             sameSite: 'none',
//             secure: true,
//             path: '/',
//         });
//         headers['set-cookie'] = [cookie];
//         console.log('New cookie set:', cookie);
//     } else {
//         console.log('Existing token found:', cookies.token);
//     }
// };

// import { Server as SocketIOServer, Socket } from 'socket.io';
// import { serialize, parse } from 'cookie';
//
// import gameSocketHandler from './game.socket';
// import { getPlayerID } from '../services/game.service';
//
// export default function setupSockets(io: SocketIOServer) {
//     // io.engine.on('initial_headers', cookiesSetup);
//     io.use(jwtMW);
//
//     io.on('connection', (socket: Socket) => {
//         console.log(`a user connected, ${socket.id}`);
//         console.log('cookie', parse(socket.handshake.headers.cookie || ''));
//         //jwtMW(socket);
//         try {
//             gameSocketHandler(io, socket);
//         } catch (e) {
//             console.error('failed on listen to socket events', e);
//         }
//
//         socket.on('disconnect', () => {
//             console.log('user disconnected');
//         });
//     });
// }
// const jwtMW = (socket: Socket, next: (err?: any) => void) => {
//     try {
//         const cookies = parse(socket.handshake.headers.cookie || '');
//         let token = cookies.token;
//
//         if (!token) {
//             token = generateUniqueToken();
//             const cookie = serialize('token', token, {
//                 httpOnly: true,
//                 sameSite: 'none',
//                 secure: true,
//                 path: '/',
//             });
//             socket.handshake.headers.cookie = `${socket.handshake.headers.cookie}; token=${token}`;
//             socket.emit('setCookie', cookie);
//         }
//
//         const playerID = getPlayerID(token);
//         if (!playerID) {
//             return next(new Error('Invalid token'));
//         }
//
//         socket.data.playerID = playerID;
//         next();
//     } catch (error) {
//         next(new Error('Error processing token'));
//     }
// };
//
// //
// // const cookiesSetup = (headers, request) => {
// //     const cookies = parse(request.headers.cookie || '');
// //     if (!cookies.token) {
// //         const cookie = serialize('token', generateUniqueToken(), {
// //             httpOnly: true,
// //             sameSite: 'none',
// //             secure: true,
// //             path: '/',
// //         });
// //         console.log('set cookie', cookie);
// //         headers['set-cookie'] = [cookie];
// //     } else {
// //         console.log('Existing token found:', cookies.token);
// //     }
// // };
// //
// // const jwtMW = (socket: Socket, next: (err?: any) => void) => {
// //     try {
// //         const cookies = parse(socket.handshake.headers.cookie || '');
// //         const token = cookies.token;
// //
// //         if (!token) {
// //             return next(new Error('No token provided'));
// //         }
// //
// //         const playerID = getPlayerID(token);
// //         if (!playerID) {
// //             return next(new Error('Invalid token'));
// //         }
// //
// //         socket.data.playerID = playerID;
// //         next();
// //     } catch (error) {
// //         next(new Error('Invalid token or error parsing token'));
// //     }
// // };
//
// function generateUniqueToken(): string {
//     return Math.random().toString(36).substr(2, 9);
// }
