
export interface CreateChatData {
  userId: string;
  technicianId: string;
  bookingId: string;
  messageText: string;
  senderType: "user" | "technician";
}
