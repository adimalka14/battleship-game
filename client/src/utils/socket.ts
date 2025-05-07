import { io } from 'socket.io-client';
//import { SERVER_URL } from './env';
console.log(process.env.NODE_ENV);
const SERVER_URL = process.env.NODE_ENV === 'production' ? '/' : 'http://localhost:3000';

const socket = io(SERVER_URL, {
    withCredentials: true,
    autoConnect: false,
    path: '/socket.io',
});

export const connectSocket = () => socket.connect();

export const disconnectSocket = () => socket.disconnect();

export const onEvent = (eventName: string, callback: any): void => {
    if (!socket.hasListeners(eventName)) {
        socket.on(eventName, callback);
    }
};

export const emitEvent = (eventName: string, data: any): void => {
    socket.emit(eventName, data);
};

export default socket;
