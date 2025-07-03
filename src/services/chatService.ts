import { IchatService } from "../interfaces/Iservices/IchatService";
import { HTTP_STATUS } from "../utils/httpStatus";
import { IchatRepository } from "../interfaces/Irepositories/IchatRepository";
import { inject, injectable } from "tsyringe";
import { IChat } from "../interfaces/Models/Ichat";
import { CreateChatData } from "../interfaces/DTO/IRepository/IchatRepository";

@injectable()
export class ChatService implements IchatService {
  constructor(
    @inject("IchatRepository") private chatRepository: IchatRepository
  ) {}

  async getChatHistory(bookingId: string): Promise<{
    success: boolean;
    status: number;
    message: string;
    data?: IChat[];
  }> {
    try {
      console.log("ChatService: Fetching chat history for booking:", bookingId);

      if (!bookingId) {
        return {
          success: false,
          status: HTTP_STATUS.BAD_REQUEST,
          message: "Booking ID is required",
        };
      }

      const chatMessages = await this.chatRepository.getChatsByBookingId(
        bookingId
      );

      console.log("ChatService: Found", chatMessages.length, "messages");

      return {
        success: true,
        status: HTTP_STATUS.OK,
        message: "Chat history fetched successfully",
        data: chatMessages,
      };
    } catch (error) {
      console.error("Error in ChatService getChatHistory:", error);
      return {
        success: false,
        status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
        message: "Failed to fetch chat history",
      };
    }
  }

  async sendChat(chatData: CreateChatData): Promise<{
    success: boolean;
    status: number;
    message: string;
    data?: IChat;
  }> {
    try {
      console.log("ChatService: Sending chat message:", chatData);

      if (!chatData.userId) {
        return {
          success: false,
          status: HTTP_STATUS.BAD_REQUEST,
          message: "User ID is required",
        };
      }

      if (!chatData.technicianId) {
        return {
          success: false,
          status: HTTP_STATUS.BAD_REQUEST,
          message: "Technician ID is required",
        };
      }

      if (!chatData.bookingId) {
        return {
          success: false,
          status: HTTP_STATUS.BAD_REQUEST,
          message: "Booking ID is required",
        };
      }

      if (!chatData.messageText || !chatData.messageText.trim()) {
        return {
          success: false,
          status: HTTP_STATUS.BAD_REQUEST,
          message: "Message text cannot be empty",
        };
      }

      if (
        !chatData.senderType ||
        !["user", "technician"].includes(chatData.senderType)
      ) {
        return {
          success: false,
          status: HTTP_STATUS.BAD_REQUEST,
          message: "Sender type must be either 'user' or 'technician'",
        };
      }

      const savedMessage = await this.chatRepository.createChat(chatData);

      console.log("ChatService: Message saved successfully");

      return {
        success: true,
        status: HTTP_STATUS.CREATED,
        message: "Message sent successfully",
        data: savedMessage,
      };
    } catch (error) {
      console.error("Error in ChatService sendChat:", error);
      return {
        success: false,
        status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
        message: "Failed to send chat message",
      };
    }
  }
}
