import { Server as HttpServer} from "http";
import { Server as SocketIOServer } from "socket.io";
import config from "../config/env";

export const initializeSocket = (Server: HttpServer) => {
  const io = new SocketIOServer(Server, {
    cors: {
      origin: config.CLIENT_URL,
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log("User Connected:", socket.id);

    //joining specific chat-room
    socket.on("join_chat", (bookingId: string) => {
      socket.join(`booking_${bookingId}`);
      console.log(`User ${socket.id} joined chat for booking: ${bookingId}`);
    });

    // leaving the chat room
    socket.on("leave_chat", (bookingId: string) => {
      socket.leave(`booking_${bookingId}`);
      console.log(`User ${socket.id} left chat for booking: ${bookingId}`);
    });

    // disconnecting the socket
    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });
  });

  return io;
};
