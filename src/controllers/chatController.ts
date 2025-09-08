import { Request, Response } from "express";
import {
  createErrorResponse,
  createSuccessResponse,
} from "../utils/responseHelper";
import { HTTP_STATUS } from "../utils/httpStatus";
import { inject, injectable } from "tsyringe";
import { IChatService } from "../interfaces/Iservices/IchatService";
import { AuthenticatedRequest } from "../middlewares/AuthMiddleware";
import { Roles } from "../config/roles";

@injectable()
export class ChatController {
  constructor(@inject("IChatService") private _chatService: IChatService) {}

  async getChatHistory(req: Request, res: Response): Promise<void> {
    try {
      console.log("Fetching chat history for booking");
      const { bookingId } = req.params;

      const serviceResponse = await this._chatService.getChatHistory(bookingId);

      if (serviceResponse.success) {
        res
          .status(HTTP_STATUS.OK)
          .json(
            createSuccessResponse(serviceResponse.data, serviceResponse.message)
          );
      } else {
        res
          .status(HTTP_STATUS.BAD_REQUEST)
          .json(
            createErrorResponse(
              serviceResponse.message || "Failed to fetch chat history"
            )
          );
      }
    } catch (error) {
      console.log("Error fetching chat history:", error);
      res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json(createErrorResponse("Internal Server Error"));
    }
  }

  async sendChat(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      console.log("Sending chat message");
      const userId = req.user?.id;
      const role = req.user?.role as Roles;
      const { bookingId } = req.params;
      const { messageText, technicianId } = req.body;
      const io = req.io;

      if (!userId) {
        res
          .status(HTTP_STATUS.UNAUTHORIZED)
          .json(createErrorResponse("User not authenticated"));
        return;
      }

      const chatData = {
        userId,
        technicianId,
        bookingId,
        messageText,
        senderType: role,
      };

      const serviceResponse = await this._chatService.sendChat(chatData);

      if (serviceResponse.success && io && serviceResponse.data) {
        io.to(`booking_${bookingId}`).emit("new_message", serviceResponse.data);
        console.log(`Message broadcasted to booking_${bookingId} room`);
      }
      if (serviceResponse.success) {
        res
          .status(HTTP_STATUS.OK)
          .json(
            createSuccessResponse(serviceResponse.data, serviceResponse.message)
          );
      } else {
        res
          .status(HTTP_STATUS.BAD_REQUEST)
          .json(
            createErrorResponse(
              serviceResponse.message || "Failed to send the chat"
            )
          );
      }
    } catch (error) {
      console.log("Error sending chat:", error);
      res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json(createErrorResponse("Internal Server Error"));
    }
  }
}
