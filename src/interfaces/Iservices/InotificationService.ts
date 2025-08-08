import { INotification } from "../Models/Inotification";

export interface INotificationService {
  createNotification(notificationData: {
    recipientId: string;
    recipientType: "user" | "admin" | "technician";
    title: string;
    message: string;
    type: string;
  }): Promise<INotification>;
  getNotificationsByUser(
    userId: string,
    userType: "user" | "admin" | "technician"
  ): Promise<INotification[]>;
  getUnreadCount(
    userId: string,
    userType: "user" | "admin" | "technician"
  ): Promise<number>;
  markNotificationAsRead(notificationId: string): Promise<INotification | null>;
}
