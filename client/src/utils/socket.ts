import { io } from 'socket.io-client';

const socket = io('http://localhost:3000', {
    withCredentials: true,
    autoConnect: false,
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
