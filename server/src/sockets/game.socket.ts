import { Server as SocketIOServer, Socket } from 'socket.io';
import {
    gameSettings,
    joinGame,
    setPlayerToSocket,
    playerReady,
    allPlayersReady,
    getGameData,
    makeMove,
    getAllGamePlayers,
    getSocketID,
    isGameFinished,
    deleteGame,
    userDisconnect,
    userLeaveLobby,
    userLeaveDuringSetup,
    userLeaveGame,
} from '../services/game.service';
import { GameData, GameState } from '../gameLogic/GameState';

export default function gameSocketHandler(io: SocketIOServer, socket: Socket) {
    setPlayerToSocket(socket.data.playerID as string, socket.id);
    let gameID: string;

    const emitToPlayers = (event: string, getData: (playerId: string) => any) => {
        try {
            const playersIds = getAllGamePlayers(gameID);
            if (!playersIds || playersIds.length === 0) {
                console.error('No players to emit to.');
                return;
            }

            playersIds.forEach((playerId) => {
                const socketId = getSocketID(playerId);
                if (socketId) {
                    const data = getData(playerId);
                    io.to(socketId).emit(event, data);
                } else {
                    console.warn(`Socket not found for player: ${playerId}`);
                }
            });
        } catch (error) {
            console.error(`Error emitting event '${event}':`, error);
        }
    };

    const handlePlayerRooms = (socketId: string) => {
        const playerSocket = io.sockets.sockets.get(socketId);
        playerSocket?.rooms.forEach((room) => {
            if (room !== socketId) {
                playerSocket?.leave(room);
            }
        });
    };

    const handleGameEnd = () => {
        const gameFinished = isGameFinished(gameID);
        if (gameFinished) {
            emitToPlayers('gameFinished', (playerId) => ({
                gameData: getGameData(gameID, playerId),
            }));
            deleteGame(gameID);
            gameID = '';
        }
    };

    const events = {
        clientConnected: () => {
            socket.emit('availableSettings', gameSettings);
        },

        joinGame: (metadata: any) => {
            try {
                metadata.playerQuery.id = socket.data.playerID as string;
                const gameData: GameData = joinGame(metadata);
                gameID = gameData.gameId;
                socket.join(gameID);
                io.to(gameID).emit('playerJoined', gameData);
            } catch (error) {
                console.error('Error in joinGame:', error);
            }
        },

        LeaveLobby: () => {
            try {
                userLeaveLobby(socket.data.playerID as string);
                emitToPlayers('playerLeftLobby', () => getGameData(gameID));
            } catch (error) {
                console.error('Error in LeaveLobby:', error);
            }
        },

        leaveDuringSetup: () => {
            const playerId = socket.data.playerID as string;
            const playersIds: string[] = getAllGamePlayers(gameID);

            userLeaveDuringSetup(playerId);

            playersIds.forEach((id) => {
                const socketId = getSocketID(id);
                const playerSocket = socketId ? io.sockets.sockets.get(socketId) : undefined;
                playerSocket?.rooms.forEach((room) => {
                    if (room !== socketId) {
                        playerSocket?.leave(room);
                    }
                });

                socketId &&
                    id !== playerId &&
                    io.to(socketId).emit('playerLeftDuringSetup', { message: 'Player left during setup' });
            });

            // try {
            //     const playerId = socket.data.playerID as string;
            //     const socketId = getSocketID(playerId);
            //
            //     socket.leave(gameID);
            //     emitToPlayers('playerLeftDuringSetup', () => ({
            //         message: 'Player left during setup',
            //     }));
            //     if (socketId) {
            //         handlePlayerRooms(socketId);
            //     }
            //     userLeaveDuringSetup(playerId);
            // } catch (error) {
            //     console.error('Error in leaveDuringSetup:', error);
            // }
        },

        leaveGame: () => {
            try {
                userLeaveGame(socket.data.playerID as string);
                socket.leave(gameID);
                emitToPlayers('updateBoard', (playerId) => ({ gameData: getGameData(gameID, playerId) }));
                handleGameEnd();
            } catch (error) {
                console.error('Error in leaveGame:', error);
            }
        },

        playerReady: (data: any) => {
            try {
                playerReady(socket.data.playerID as string, data);
                const { allReady, readyCount } = allPlayersReady(gameID);
                if (allReady) {
                    emitToPlayers('allPlayersReady', (playerId) => ({
                        gameData: getGameData(gameID, playerId),
                    }));
                } else {
                    emitToPlayers('playerReady', () => ({
                        readyCount,
                    }));
                }
            } catch (error) {
                console.error('Error in playerReady:', error);
            }
        },

        getGameData: () => {
            try {
                const gameData = getGameData(gameID, socket.data.playerID as string);
                socket.emit('updateBoard', { gameData });
            } catch (error) {
                console.error('Error in getGameData:', error);
            }
        },

        playerShoot: (data: any) => {
            try {
                const playerId = socket.data.playerID as string;
                const attackResult = makeMove(gameID, playerId, data.playerBeingAttacked, data.positions);
                emitToPlayers('updateBoard', (playerId) => ({
                    gameData: getGameData(gameID, playerId),
                    attackResult,
                }));
                handleGameEnd();
            } catch (error) {
                console.error('Error in playerShoot:', error);
            }
        },

        disconnect: () => {
            try {
                console.log('User disconnected:', socket.id);
                const { state } = getGameData(gameID);

                switch (state) {
                    case GameState.IN_PROGRESS:
                        events.leaveGame();
                        // userDisconnect(socket.data.playerID as string);
                        // emitToPlayers('updateBoard', (playerId) => ({
                        //     gameData: getGameData(gameID, playerId),
                        // }));
                        break;
                    case GameState.WAITING_FOR_PLAYERS:
                        events.LeaveLobby();
                        break;
                    case GameState.SETTING_UP_BOARD:
                        events.leaveDuringSetup();
                        break;
                }
            } catch (error) {
                console.error('Error in disconnect:', error);
            }
        },
    };

    Object.entries(events).forEach(([event, handler]) => {
        socket.on(event, handler);
    });
}

// import { Server as SocketIOServer, Socket } from 'socket.io';
// import {
//     gameSettings,
//     joinGame,
//     setPlayerToSocket,
//     playerReady,
//     allPlayersReady,
//     getGameData,
//     makeMove,
//     getAllGamePlayers,
//     getSocketID,
//     isGameFinished,
//     deleteGame,
//     userDisconnect,
//     userLeaveLobby,
//     userLeaveDuringSetup,
//     userLeaveGame,
// } from '../services/game.service';
// import { GameData } from '../gameLogic/GameState';
//
// export default function gameSocketHandler(io: SocketIOServer, socket: Socket) {
//     setPlayerToSocket(socket.data.playerID as string, socket.id);
//
//     let gameID: string;
//
//     socket.on('clientConnected', () => {
//         socket.emit('availableSettings', gameSettings);
//     });
//
//     socket.on('joinGame', (metadata) => {
//         metadata.playerQuery.id = socket.data.playerID as string;
//         const gameData: GameData = joinGame(metadata);
//         const { gameId } = gameData;
//         gameID = gameId;
//         socket.join(gameId);
//         io.to(gameId).emit('playerJoined', gameData);
//     });
//
//     socket.on('LeaveLobby', () => {
//         const playerId = socket.data.playerID as string;
//         userLeaveLobby(playerId);
//         io.to(gameID).emit('playerLeftLobby', getGameData(gameID));
//     });
//
//     socket.on('leaveDuringSetup', () => {
//         const playerId = socket.data.playerID as string;
//         const playersIds: string[] = getAllGamePlayers(gameID);
//
//         userLeaveDuringSetup(playerId);
//
//         playersIds.forEach((id) => {
//             const socketId = getSocketID(id);
//             const playerSocket = socketId ? io.sockets.sockets.get(socketId) : undefined;
//             playerSocket?.rooms.forEach((room) => {
//                 if (room !== socketId) {
//                     playerSocket?.leave(room);
//                 }
//             });
//
//             socketId &&
//                 id !== playerId &&
//                 io.to(socketId).emit('playerLeftDuringSetup', { message: 'Player left during setup' });
//         });
//     });
//
//     socket.on('leaveGame', () => {
//         try {
//             const playerId = socket.data.playerID as string;
//
//             userLeaveGame(playerId);
//             socket.leave(gameID);
//
//             const playersIds: string[] = getAllGamePlayers(gameID);
//             const gameFinished = isGameFinished(gameID);
//
//             playersIds.forEach((playerId) => {
//                 const socketId = getSocketID(playerId);
//                 const gameData = getGameData(gameID, playerId);
//                 if (gameFinished) {
//                     socketId && io.to(socketId).emit('gameFinished', { gameData });
//                 } else {
//                     socketId && io.to(socketId).emit('updateBoard', { gameData });
//                 }
//             });
//
//             if (gameFinished) {
//                 deleteGame(gameID);
//             }
//
//             gameID = '';
//         } catch (error: unknown) {
//             if (error instanceof Error) {
//                 console.error('Error leaving game:', error.message);
//             }
//         }
//     });
//
//     socket.on('playerReady', (data: any) => {
//         // todo: check validations before emit
//         const playerId = socket.data.playerID as string;
//         playerReady(playerId, data);
//         const { allReady, readyCount } = allPlayersReady(gameID);
//         if (allReady) {
//             const playersIds: string[] = getAllGamePlayers(gameID);
//             playersIds.forEach((playerId) => {
//                 const socketId = getSocketID(playerId);
//                 const gameData = getGameData(gameID, playerId);
//
//                 socketId && io.to(socketId).emit('allPlayersReady', { gameData });
//             });
//         } else {
//             io.to(gameID).emit('playerReady', readyCount);
//         }
//     });
//
//     socket.on('getGameData', () => {
//         const gameData = getGameData(gameID, socket.data.playerID as string);
//
//         socket.emit('updateBoard', { gameData });
//     });
//
//     socket.on('playerShoot', (data) => {
//         try {
//             const playerId = socket.data.playerID as string;
//             const attackResult = makeMove(gameID, playerId, data.playerBeingAttacked, data.position);
//             const playersIds: string[] = getAllGamePlayers(gameID);
//             const gameFinished = isGameFinished(gameID);
//
//             playersIds.forEach((playerId) => {
//                 const socketId = getSocketID(playerId);
//                 const gameData = getGameData(gameID, playerId);
//                 if (gameFinished) {
//                     socketId && io.to(socketId).emit('gameFinished', { gameData, attackResult });
//                 } else {
//                     socketId && io.to(socketId).emit('updateBoard', { gameData, attackResult });
//                 }
//             });
//
//             if (gameFinished) {
//                 deleteGame(gameID);
//             }
//         } catch (e) {
//             console.error(e);
//         }
//     });
//
//     socket.on('disconnect', () => {
//         const playerId = socket.data.playerID as string;
//         userDisconnect(playerId);
//         io.to(gameID).emit('playerLeft', getGameData(gameID));
//     });
// }
//
// function getCookieValue(cookie: string | undefined, key: string): string | undefined {
//     if (!cookie) return undefined;
//     const match = cookie.split('; ').find((c) => c.startsWith(`${key}=`));
//     return match ? match.split('=')[1] : undefined;
// }
