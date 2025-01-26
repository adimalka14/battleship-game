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
    userLeaveLobby,
    userLeaveDuringSetup,
    userLeaveGame,
} from '../services/game.service';
import { GameData, GameState } from '../gameLogic/GameState';

export default function gameSocketHandler(io: SocketIOServer, socket: Socket) {
    let playerId = socket.data.playerID as string;
    let username = socket.data.username as string;
    let gameID: string;

    // todo: player return back to active game
    setPlayerToSocket(playerId, socket.id);

    socket.emit('availableSettings', gameSettings);

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
        joinGame: (metadata: any) => {
            try {
                metadata.playerQuery = {
                    id: socket.data.playerID as string,
                    username: socket.data.username as string,
                };
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
