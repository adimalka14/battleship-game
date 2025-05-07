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
import logger from '../utils/logger';

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
                logger.error(socket.id, 'No players to emit to.');
                return;
            }

            playersIds.forEach((playerId) => {
                const socketId = getSocketID(playerId);
                if (socketId) {
                    const data = getData(playerId);
                    io.to(socketId).emit(event, data);
                } else {
                    logger.warn(socket.id, 'Socket not found for player', { playerId });
                }
            });
        } catch (error) {
            logger.error(socket.id, 'Error emitting event', { event, error });
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
            logger.info(socket.id, 'Game finished', { gameData: getGameData(gameID) });
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
                logger.info(socket.id, 'Player joined the game', { playerId, gameID });
                io.to(gameID).emit('playerJoined', gameData);
            } catch (error) {
                logger.error(socket.id, 'Error in joinGame:', { playerId, gameID, error });
            }
        },

        LeaveLobby: () => {
            try {
                userLeaveLobby(socket.data.playerID as string);
                emitToPlayers('playerLeftLobby', () => getGameData(gameID));
                logger.info(socket.id, 'Player left the lobby', { playerId, gameID });
            } catch (error) {
                logger.error(socket.id, 'Error in LeaveLobby:', { playerId, gameID, error });
            }
        },

        leaveDuringSetup: () => {
            try {
                const playerId = socket.data.playerID as string;
                const playersIds: string[] = getAllGamePlayers(gameID);

                userLeaveDuringSetup(playerId);
                logger.info(socket.id, 'Player left during setup', { playerId, gameID });

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
            } catch (error) {
                logger.error(socket.id, 'Error in leaveDuringSetup:', { playerId, gameID, error });
            }
        },

        leaveGame: () => {
            try {
                userLeaveGame(socket.data.playerID as string);
                socket.leave(gameID);
                emitToPlayers('updateBoard', (playerId) => ({ gameData: getGameData(gameID, playerId) }));
                handleGameEnd();
            } catch (error) {
                logger.error(socket.id, 'Error in leaveGame:', { playerId, gameID, error });
            }
        },

        playerReady: (data: any) => {
            try {
                playerReady(socket.data.playerID as string, data);
                logger.info(socket.id, 'Player is ready', { playerId });

                const { allReady, readyCount } = allPlayersReady(gameID);
                if (allReady) {
                    logger.info(gameID, 'All players are ready');
                    emitToPlayers('allPlayersReady', (playerId) => ({
                        gameData: getGameData(gameID, playerId),
                    }));
                } else {
                    emitToPlayers('playerReady', () => ({
                        readyCount,
                    }));
                }
            } catch (error) {
                logger.error(socket.id, 'Error in playerReady:', { playerId, gameID, error });
            }
        },

        getGameData: () => {
            try {
                const gameData = getGameData(gameID, socket.data.playerID as string);
                socket.emit('updateBoard', { gameData });
            } catch (error) {
                logger.error(socket.id, 'Error in getGameData:', { playerId, gameID, error });
            }
        },

        playerShoot: (data: any) => {
            try {
                const playerId = socket.data.playerID as string;
                const attackResult = makeMove(gameID, playerId, data.playerBeingAttacked, data.positions);
                logger.info(socket.id, 'Player shot', { attackResult });

                emitToPlayers('updateBoard', (playerId) => ({
                    gameData: getGameData(gameID, playerId),
                    attackResult,
                }));
                handleGameEnd();
            } catch (error) {
                logger.error(socket.id, 'Error in playerShoot:', { playerId, gameID, error });
            }
        },

        disconnect: () => {
            try {
                const { state } = getGameData(gameID);
                let leaveInfo: string = '';

                switch (state) {
                    case GameState.IN_PROGRESS:
                        events.leaveGame();
                        leaveInfo = 'Player left the game';
                        // userDisconnect(socket.data.playerID as string);
                        // emitToPlayers('updateBoard', (playerId) => ({
                        //     gameData: getGameData(gameID, playerId),
                        // }));
                        break;
                    case GameState.WAITING_FOR_PLAYERS:
                        events.LeaveLobby();
                        leaveInfo = 'Player left the lobby';
                        break;
                    case GameState.SETTING_UP_BOARD:
                        events.leaveDuringSetup();
                        leaveInfo = 'Player left during board setup';
                        break;
                }

                logger.info(socket.id, leaveInfo);
            } catch (error) {
                logger.error(socket.id, 'Error in disconnect:', { error });
            }
        },
    };

    Object.entries(events).forEach(([event, handler]) => {
        socket.on(event, handler);
    });
}
