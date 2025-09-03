import { INotification } from "../Models/Inotification";

export interface INotificationService {
  createNotification(notificationData: {
    recipientId: string;
    recipientType: "user" | "admin" | "technician";
    title: string;
    message: string;
    type: string;
  }): Promise<INotification>;
  getUnReadNotificationsByUser(
    userId: string,
    userType: string
  ): Promise<INotification[]>;
  markNotificationAsRead(notificationId: string): Promise<INotification | null>;
}
