import { Server as HttpServer } from "http";
import { Server } from "socket.io";
import { env } from "./env";

const userSockets = new Map<string, Set<string>>();

export let io: Server;

export const setupSocket = (server: HttpServer): Server => {
  io = new Server(server, {
    cors: {
      origin: env.clientOrigin,
      credentials: true,
    },
  });

  io.use((socket, next) => {
    const userId = socket.handshake.auth.userId;
    if (!userId) {
      next(new Error("Unauthorized socket"));
      return;
    }

    next();
  });

  io.on("connection", (socket) => {
    const userId = String(socket.handshake.auth.userId);
    if (!userSockets.has(userId)) {
      userSockets.set(userId, new Set());
    }
    userSockets.get(userId)?.add(socket.id);

    socket.on("disconnect", () => {
      const sockets = userSockets.get(userId);
      if (!sockets) {
        return;
      }
      sockets.delete(socket.id);
      if (sockets.size === 0) {
        userSockets.delete(userId);
      }
    });
  });

  return io;
};

export const emitToUser = (
  userId: string,
  event: string,
  payload: unknown,
): void => {
  const sockets = userSockets.get(userId);
  if (!sockets || !io) {
    return;
  }

  for (const socketId of sockets) {
    io.to(socketId).emit(event, payload);
  }
};
