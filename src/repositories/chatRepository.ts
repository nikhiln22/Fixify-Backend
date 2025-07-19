import { CreateChatData } from "../interfaces/DTO/IRepository/IchatRepository";
import { IChatRepository } from "../interfaces/Irepositories/IchatRepository";
import { IChat } from "../interfaces/Models/Ichat";
import chat from "../models/chatModel";
import { BaseRepository } from "./baseRepository";
import mongoose from "mongoose";

export class ChatRepository
  extends BaseRepository<IChat>
  implements IChatRepository
{
  constructor() {
    super(chat);
  }

  async createChat(chatData: CreateChatData): Promise<IChat> {
    try {
      console.log("ChatRepository: Creating new chat message:", chatData);

      const chatDataWithObjectIds = {
        ...chatData,
        userId: new mongoose.Types.ObjectId(chatData.userId),
        technicianId: new mongoose.Types.ObjectId(chatData.technicianId),
        bookingId: new mongoose.Types.ObjectId(chatData.bookingId),
      };

      const newChat = await this.create(chatDataWithObjectIds);

      console.log("ChatRepository: Chat message created successfully");
      return newChat;
    } catch (error) {
      console.error("Error in ChatRepository createChat:", error);
      throw new Error("Failed to create chat message");
    }
  }

  async getChatsByBookingId(bookingId: string): Promise<IChat[]> {
    try {
      console.log("ChatRepository: Fetching chats for booking:", bookingId);

      const chats = await this.findAll(
        { bookingId: new mongoose.Types.ObjectId(bookingId) },
        { createdAt: 1 }
      );

      console.log("ChatRepository: Found", chats.length, "chat messages");
      return chats;
    } catch (error) {
      console.error("Error in ChatRepository getChatsByBookingId:", error);
      throw new Error("Failed to fetch chat messages");
    }
  }
}
