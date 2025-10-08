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
    technicianId: string,
    includePast: boolean,
    additionalFilters?: { [key: string]: string | number | boolean | Date }
  ): Promise<{
    success: boolean;
    message: string;
    data?: ITimeSlot[];
  }>;

  blockTimeSlot(
    technicianId: string,
    slotId: string
  ): Promise<{
    success: boolean;
    message: string;
    data?: ITimeSlot;
  }>;

  updateSlotBookingStatus(
    technicianId: string,
    slotId: string,
    isBooked: boolean
  ): Promise<{
    success: boolean;
    message: string;
    data?: ITimeSlot;
  }>;

  blockMultipleSlotsForService(
    technicianId: string,
    startTimeSlotId: string,
    serviceDurationMinutes: number
  ): Promise<{
    success: boolean;
    message: string;
    blockedSlots?: string[];
  }>;
  unblockMultipleSlots(
    technicianId: string,
    slotIds: string[]
  ): Promise<{
    success: boolean;
    message: string;
  }>;
  reserveTimeSlot(
    technicianId: string,
    slotId: string,
    userId: string,
    durationInMinutes: number
  ): Promise<{
    success: boolean;
    message: string;
    reservedSlots?: string[];
  }>;
  releaseReservedSlots(
    technicianId: string,
    slotIds: string[]
  ): Promise<{ success: boolean; message: string }>;
  confirmReservedSlots(
    technicianId: string,
    userId: string,
    slotIds: string[]
  ): Promise<string[]>;
}
