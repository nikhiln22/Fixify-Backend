import { INotification } from "../Models/Inotification";

export interface INotificationRepository {
  createNotification(notificationData: {
    recipientId: string;
    recipientType: "user" | "admin" | "technician";
    title: string;
    message: string;
    type: string;
  }): Promise<INotification>;

  getUnReadNotificationsByUser(
    userId: string,
    userType: "user" | "admin" | "technician"
  ): Promise<INotification[]>;

  markAsRead(notificationId: string): Promise<INotification | null>;
}
