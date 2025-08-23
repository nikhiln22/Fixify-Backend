import { Server as HttpServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import config from "../config/env";
import { ISocketNotificationData } from "../interfaces/DTO/IServices/InotificationService";

const userSockets = new Map<string, string>();

export const initializeSocket = (Server: HttpServer) => {
  const io = new SocketIOServer(Server, {
    cors: {
      origin: config.CLIENT_URL,
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    // this is for authenticating users for the notification
    socket.on(
      "user_authenticate",
      (data: { userId: string; userType: "user" | "admin" | "technician" }) => {
        userSockets.set(data.userId, socket.id);
        // Join user specific specific room
        socket.join(`${data.userType}_${data.userId}`);
      }
    );

    //joining specific chat-room
    socket.on("join_chat", (bookingId: string) => {
      socket.join(`booking_${bookingId}`);
    });

    // leaving the chat room
    socket.on("leave_chat", (bookingId: string) => {
      socket.leave(`booking_${bookingId}`);
    });

    // used for marking notification as read
    socket.on("mark_notification_read", (notificationId: string) => {
      console.log(
        `Notification ${notificationId} marked as read by ${socket.id}`
      );
    });

    // disconnecting the socket
    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });
  });

  return io;
};

// helper function used to sent the notifications for the user("admin" | "user" | "technician")
export const sendNotificationToUser = (
  io: SocketIOServer,
  userId: string,
  userType: "user" | "admin" | "technician",
  notificationData: ISocketNotificationData
) => {
  io.to(`${userType}_${userId}`).emit("new_notification", notificationData);
};
