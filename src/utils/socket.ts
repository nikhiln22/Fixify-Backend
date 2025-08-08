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
    console.log("User Connected:", socket.id);

    // this is for authenticating users for the notification
    socket.on(
      "user_authenticate",
      (data: { userId: string; userType: "user" | "admin" | "technician" }) => {
        userSockets.set(data.userId, socket.id);
        // Join user specific specific room
        socket.join(`${data.userType}_${data.userId}`);
        console.log(
          `User ${data.userId} (${data.userType}) authenticated with socket ${socket.id}`
        );
      }
    );

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

    // used for marking notification as read
    socket.on("mark_notification_read", (notificationId: string) => {
      console.log(
        `Notification ${notificationId} marked as read by ${socket.id}`
      );
    });

    // socket.on("get_unread_count", (userId: string) => {
    // Send current unread count to user
    // This will be handled by your notification service
    // });

    // disconnecting the socket
    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });
  });

  // for (const [userId, socketId] of userSockets.entries()) {
  //   if (socketId === socket.id) {
  //     userSockets.delete(userId);
  //     break;
  //   }
  // }

  return io;
};

// helper function to sent the notifications for the user
export const sendNotificationToUser = (
  io: SocketIOServer,
  userId: string,
  userType: "user" | "admin" | "technician",
  notificationData: ISocketNotificationData
) => {
  io.to(`${userType}_${userId}`).emit("new_notification", notificationData);
};

// helper function to sent the notifications for multiple users
export const sendNotificationToMultipleUsers = (
  io: SocketIOServer,
  recipients: Array<{
    userId: string;
    userType: "user" | "admin" | "technician";
  }>,
  notificationData: ISocketNotificationData
) => {
  recipients.forEach((recipient) => {
    io.to(`${recipient.userType}_${recipient.userId}`).emit(
      "new_notification",
      notificationData
    );
  });
};
