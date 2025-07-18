import { IChat } from "../Models/Ichat";
import { CreateChatData } from "../DTO/IRepository/IchatRepository";

export interface IChatRepository {
  createChat(chatData: CreateChatData): Promise<IChat>;
  getChatsByBookingId(bookingId: string): Promise<IChat[]>;
}
