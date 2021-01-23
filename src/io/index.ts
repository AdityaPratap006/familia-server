import { Server as SocketServer, Socket } from 'socket.io';
import http from 'http';
import chalk from 'chalk';
import util from 'util';
import { SocketIOEvents } from './ioEvents/socket.ioEvents';
import { UserIOEvents } from './ioEvents/user.ioEvents';
import { VideoCallIOEvents } from './ioEvents/videoCall.ioEvents';
import { RoomIOEvents } from './ioEvents/room.ioEvents';

// const usersMap = new Map<string, string>();

// const getObjectFromMap = (map: Map<string, any>) => {
//     const obj: Record<string, any> = {};

//     map.forEach((value, key) => {
//         obj[key] = value;
//     });

//     return obj;
// }

interface UserSocket {
    userId: string;
    socketId: string;
}

const videoCallRoomMap = new Map<string, UserSocket[]>();

const addUserToRoom = (socket: Socket, roomId: string, userId: string) => {
    const socketId = socket.id;

    socket.join(roomId);
    socket.to(roomId).broadcast.emit(UserIOEvents.USER_CONNECTED, userId);

    if (videoCallRoomMap.has(roomId)) {
        const userSocketList = videoCallRoomMap.get(roomId) || [];
        const userExists = !!userSocketList.find(userSocket => userSocket.socketId === socketId);

        if (!userExists) {
            userSocketList.push({
                userId,
                socketId,
            });
        }

        videoCallRoomMap.set(roomId, userSocketList);
    } else {
        videoCallRoomMap.set(roomId, [{ socketId, userId }]);
    }

    console.table(util.inspect(videoCallRoomMap, { depth: 10 }));
}

const removeSocketFromRoom = (socketId: string) => {
    let targetFound = false;

    videoCallRoomMap.forEach((userSockets, roomId) => {
        if (targetFound) {
            return;
        }

        const sockets = userSockets.filter(userSocket => userSocket.socketId !== socketId);
        videoCallRoomMap.set(roomId, sockets);
    });

    console.table(util.inspect(videoCallRoomMap, { depth: 10 }));
}

const getRoomAndUserWhereSocketHasJoined = (socketId: string) => {
    let targetFound = false;
    let targetRoomId = '';
    let targetUserId = '';
    videoCallRoomMap.forEach((userSockets, roomId) => {
        if (targetFound) {
            return;
        }

        const sockets = userSockets.map(userSocket => userSocket.socketId);

        if (sockets.includes(socketId)) {
            targetRoomId = roomId;
            const userId = userSockets.find(userSocket => userSocket.socketId === socketId)?.userId;
            targetUserId = userId || '';
            targetFound = true;
        }
    });

    return { targetRoomId, targetUserId };
}

export const initIOServer = (server: http.Server) => {
    console.log(chalk.hex(`#9932CC`)(`Starting socketIO server...`));
    const io = new SocketServer(server, {
        cors: {
            origin: '*',
        },
    });

    io.on(SocketIOEvents.CONNECTION, (socket: Socket) => {

        socket.on(RoomIOEvents.JOIN_ROOM, (roomId: string, userId: string) => {
            console.log(chalk.green(`socketId: ${socket.id}, userId: ${userId} joined room ${roomId}`));
            addUserToRoom(socket, roomId, userId);
        });


        socket.on(SocketIOEvents.DISCONNECT, () => {

            console.log(chalk.red(socket.id, ' disconnected!'));

            const { targetRoomId, targetUserId } = getRoomAndUserWhereSocketHasJoined(socket.id);

            socket.broadcast.emit(UserIOEvents.USER_DISCONNECTED, targetUserId);

            io.sockets.in(targetRoomId).emit(UserIOEvents.USER_DISCONNECTED, targetUserId);

            removeSocketFromRoom(socket.id);
        });

        // socket.on(VideoCallIOEvents.CALL_USER, (data) => {
        //     io.to(data.userToCall).emit(VideoCallIOEvents.INCOMING_CALL, {
        //         signal: data.signalData,
        //         from: data.from,
        //     });
        // });

        // socket.on(VideoCallIOEvents.ACCEPT_CALL, (data) => {
        //     io.to(data.to).emit(VideoCallIOEvents.CALL_ACCEPTED, data.signal);
        // });
    });
}