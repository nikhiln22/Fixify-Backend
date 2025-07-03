import { CreateChatData } from "../DTO/IRepository/IchatRepository";
import { IChat } from "../Models/Ichat";

export interface IchatService {
  sendChat(chatData: CreateChatData): Promise<{
    success: boolean;
    status: number;
    message: string;
    data?: IChat;
  }>;
  getChatHistory(bookingId: string): Promise<{
    success: boolean;
    status: number;
    message: string;
    data?: IChat[];
  }>;
}
