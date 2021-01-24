import { Server as SocketServer, Socket } from 'socket.io';
import http from 'http';
import chalk from 'chalk';
import util from 'util';
import { SocketIOEvents } from './ioEvents/socket.ioEvents';
import { UserIOEvents } from './ioEvents/user.ioEvents';
import { RoomIOEvents } from './ioEvents/room.ioEvents';
import { SignalIOEvents } from './ioEvents/signal.ioEvents';

const usersByRoomMap = new Map<string, string[]>();
const socketToRoomMap = new Map<string, string>();

export const initIOServer = (server: http.Server) => {
    console.log(chalk.hex(`#9932CC`)(`Starting socketIO server...`));
    const io = new SocketServer(server, {
        cors: {
            origin: '*',
        },
    });

    io.on(SocketIOEvents.CONNECTION, (socket: Socket) => {

        socket.on(RoomIOEvents.JOIN_ROOM, (roomId: string) => {
            console.log(chalk.green(`socketId: ${socket.id} joined room ${roomId}`));

            const room = usersByRoomMap.get(roomId);
            if (room) {
                const numOfUsers = room.length;
                if (numOfUsers === 2) {
                    socket.emit(RoomIOEvents.ROOM_FULL);
                    return;
                }

                room.push(socket.id);
            } else {
                usersByRoomMap.set(roomId, [socket.id]);
            }

            socketToRoomMap.set(socket.id, roomId);
            const usersInThisRoom = usersByRoomMap.get(roomId)?.filter(id => id !== socket.id) || [];
            socket.emit(UserIOEvents.ALL_USERS, usersInThisRoom);
            console.log(util.inspect({ usersByRoomMap, socketToRoomMap }));
        });


        socket.on(SocketIOEvents.DISCONNECT, () => {
            console.log(chalk.red(socket.id, ' disconnected!'));
            const roomId = socketToRoomMap.get(socket.id);
            if (roomId) {
                let room = usersByRoomMap.get(roomId);
                if (room) {
                    room = room.filter(id => id !== socket.id);
                    usersByRoomMap.set(roomId, room);
                    socketToRoomMap.delete(socket.id);
                }
                socket.broadcast.emit(UserIOEvents.USER_DISCONNECTED, socket.id);
            }
            console.log(util.inspect({ usersByRoomMap, socketToRoomMap }));
        });

        socket.on(SignalIOEvents.SENDING_SIGNAL, payload => {
            const { userToSignal, signal, callerID } = payload;
            io.to(userToSignal).emit(UserIOEvents.USER_JOINED, { signal, callerID });
        });

        socket.on(SignalIOEvents.RETURNING_SIGNAL, payload => {
            const { callerID, signal } = payload;
            io.to(callerID).emit(SignalIOEvents.RECEIVING_RETURNED_SIGNAL, { signal, id: socket.id });
        });
    });
}