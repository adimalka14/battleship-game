import { io } from "socket.io-client";

const socket = io("http://localhost:3000");

export const connectSocket = () => socket.connect();

export const disconnectSocket = () => socket.disconnect();

export const onEvent = (eventName: string, callback: any): void => {
    socket.on(eventName, callback);
};

export const emitEvent = (eventName: string, data: any):void => {
    socket.emit(eventName, data);
};