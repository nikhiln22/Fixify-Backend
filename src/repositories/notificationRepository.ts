import { injectable } from "tsyringe";
import { BaseRepository } from "./baseRepository";
import { INotification } from "../interfaces/Models/Inotification";
import { INotificationRepository } from "../interfaces/Irepositories/InotificationRepository";
import notification from "../models/notificationModel";

@injectable()
export class NotificationRepository
  extends BaseRepository<INotification>
  implements INotificationRepository
{
  constructor() {
    super(notification);
  }

  async createNotification(notificationData: {
    recipientId: string;
    recipientType: "user" | "admin" | "technician";
    title: string;
    message: string;
    type: string;
  }): Promise<INotification> {
    try {
      console.log(
        "notification data in the notification create repository:",
        notificationData
      );

      const newNotification = await this.model.create(notificationData);

      console.log("Notification created successfully:", newNotification);

      return newNotification;
    } catch (error) {
      console.error("Error creating notification in repository:", error);
      throw error;
    }
  }

  async getUnReadNotificationsByUser(
    userId: string,
    userType: "user" | "admin" | "technician"
  ): Promise<INotification[]> {
    try {
      console.log(
        `Getting notifications for user: ${userId}, type: ${userType}`
      );

      const notifications = (await this.find(
        {
          recipientId: userId,
          recipientType: userType,
          isRead:false
        },
        {
          sort: { createdAt: -1 },
          populate: { path: "recipientId" },
        }
      )) as INotification[];

      console.log(
        `Found ${notifications.length} notifications for user ${userId}`
      );
      return notifications;
    } catch (error) {
      console.error(
        "Error getting notifications by user in repository:",
        error
      );
      throw error;
    }
  }

  async markAsRead(notificationId: string): Promise<INotification | null> {
    try {
      console.log(`Marking notification ${notificationId} as read`);

      const updatedNotification = await this.updateOne(
        { _id: notificationId },
        { isRead: true }
      );

      if (updatedNotification) {
        console.log(
          `Notification ${notificationId} marked as read successfully`
        );
      } else {
        console.log(`Notification ${notificationId} not found`);
      }

      return updatedNotification;
    } catch (error) {
      console.error("Error marking notification as read in repository:", error);
      throw error;
    }
  }
}
