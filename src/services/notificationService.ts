import { INotificationService } from "../interfaces/Iservices/InotificationService";
import { INotificationRepository } from "../interfaces/Irepositories/InotificationRepository";
import { injectable, inject } from "tsyringe";
import { INotification } from "../interfaces/Models/Inotification";

@injectable()
export class NotificationService implements INotificationService {
  constructor(
    @inject("INotificationRepository")
    private _notificationRepository: INotificationRepository
  ) {}

  async createNotification(notificationData: {
    recipientId: string;
    recipientType: "user" | "admin" | "technician";
    title: string;
    message: string;
    type: string;
  }): Promise<INotification> {
    try {
      console.log(
        "entered inside the create notification function in the notification service:"
      );
      console.log("received notification Data:", notificationData);

      const createNotification =
        await this._notificationRepository.createNotification(notificationData);

      console.log(
        "created notification in the notification Service:",
        createNotification
      );

      return createNotification;
    } catch (error) {
      console.log("error occurred while creating the notification:", error);
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

      const notifications =
        await this._notificationRepository.getUnReadNotificationsByUser(
          userId,
          userType
        );

      console.log(
        `Found ${notifications.length} notifications for user ${userId}`
      );
      return notifications;
    } catch (error) {
      console.log("error occurred while getting user notifications:", error);
      throw error;
    }
  }

  async markNotificationAsRead(
    notificationId: string
  ): Promise<INotification | null> {
    try {
      console.log(`Marking notification ${notificationId} as read`);

      const updatedNotification = await this._notificationRepository.markAsRead(
        notificationId
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
      console.log("error occurred while marking notification as read:", error);
      throw error;
    }
  }

  // async markAllNotificationsAsRead(
  //   userId: string,
  //   userType: "user" | "admin" | "technician"
  // ): Promise<void> {
  //   try {
  //     console.log(
  //       `Marking all notifications as read for user: ${userId}, type: ${userType}`
  //     );

  //     await this._notificationRepository.markAllAsRead(userId, userType);

  //     console.log(`All notifications marked as read for user ${userId}`);
  //   } catch (error) {
  //     console.log(
  //       "error occurred while marking all notifications as read:",
  //       error
  //     );
  //     throw error;
  //   }
  // }
}
