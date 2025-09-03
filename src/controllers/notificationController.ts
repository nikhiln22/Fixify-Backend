import { Response } from "express";
import { AuthenticatedRequest } from "../middlewares/AuthMiddleware";
import { HTTP_STATUS } from "../utils/httpStatus";
import {
  createErrorResponse,
  createSuccessResponse,
} from "../utils/responseHelper";
import { inject, injectable } from "tsyringe";
import { INotificationService } from "../interfaces/Iservices/InotificationService";
import { Roles } from "../config/roles";

@injectable()
export class NotificationController {
  constructor(
    @inject("INotificationService")
    private _notificationService: INotificationService
  ) {}

  async getAllUnReadNotifications(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    try {
      console.log(
        "enetring the user controller function that fetches the all notifications:"
      );
      const userId = req.user?.id;
      const role = req.user?.role as Roles;

      if (!userId) {
        res
          .status(HTTP_STATUS.UNAUTHORIZED)
          .json(createErrorResponse("User not authenticated"));
        return;
      }

      const notifications =
        await this._notificationService.getUnReadNotificationsByUser(
          userId,
          role
        );

      res
        .status(HTTP_STATUS.OK)
        .json(
          createSuccessResponse(
            notifications,
            "Notifications fetched successfully"
          )
        );
    } catch (error) {
      console.log("error occured while fetching the notifications:", error);
      res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json(createErrorResponse("Internal Server Error"));
    }
  }

  async markNotificationRead(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    try {
      const userId = req.user?.id;
      const { notificationId } = req.params;

      if (!userId) {
        res
          .status(HTTP_STATUS.UNAUTHORIZED)
          .json(createErrorResponse("User not authenticated"));
        return;
      }

      const updatedNotification =
        await this._notificationService.markNotificationAsRead(notificationId);

      if (updatedNotification) {
        res
          .status(HTTP_STATUS.OK)
          .json(
            createSuccessResponse(
              updatedNotification,
              "Notification marked as read"
            )
          );
      } else {
        res
          .status(HTTP_STATUS.NOT_FOUND)
          .json(createErrorResponse("Notification not found"));
      }
    } catch (error) {
      console.log(
        "error occured while marking all notifications as read:",
        error
      );
      res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json(createErrorResponse("Internal Server Error"));
    }
  }
}
