import { AddTimeSlotsResult } from "../DTO/IServices/ItechnicianService";
import { ITimeSlot } from "../Models/ItimeSlot";

export interface ITimeSlotService {
  addTimeSlots(
    technicianId: string,
    data: {
      dateTimeSlots: Array<{
        date: string;
        startTime: string;
        endTime: string;
      }>;
    }
  ): Promise<AddTimeSlotsResult>;

  getTimeSlots(
    technicianId: String,
    includePast: boolean,
    additionalFilters?: { [key: string]: any }
  ): Promise<{
    success: boolean;
    message: string;
    status: number;
    data?: ITimeSlot[];
  }>;

  blockTimeSlot(
    technicianId: string,
    slotId: string
  ): Promise<{
    success: boolean;
    message: string;
    status: number;
    data?: ITimeSlot;
  }>;

  updateSlotBookingStatus(
    technicianId: string,
    slotId: string,
    isBooked: boolean
  ): Promise<{
    success: boolean;
    message: string;
    status: number;
    data?: ITimeSlot;
  }>;
}
