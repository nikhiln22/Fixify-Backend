import { CreateChatData } from "../DTO/IRepository/IchatRepository";
import { IChat } from "../Models/Ichat";

export interface IChatService {
  sendChat(chatData: CreateChatData): Promise<{
    success: boolean;
    message: string;
    data?: IChat;
  }>;
  getChatHistory(bookingId: string): Promise<{
    success: boolean;
    message: string;
    data?: IChat[];
  }>;
}
