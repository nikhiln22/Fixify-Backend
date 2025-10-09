import { ITimeSlot } from "../Models/ItimeSlot";

export interface ITimeSlotRepository {
  findSlot(
    technicianId: string,
    date: string,
    startTime: string,
    endTime: string
  ): Promise<ITimeSlot | null>;
  newTimeslot(
    technicianId: string,
    date: string,
    startTime: string,
    endTime: string
  ): Promise<ITimeSlot>;
  findOverlappingSlots(
    technicianId: string,
    date: string,
    startTime: string,
    endTime: string
  ): Promise<ITimeSlot[]>;
  getTimeSlots(
    technicianId: string,
    includePast: boolean,
    additionalFilters?: { [key: string]: string | number | boolean | Date }
  ): Promise<ITimeSlot[]>;
  updateSlotBookingStatus(
    technicianId: string,
    slotId: string,
    data: {
      isBooked?: boolean;
      isReserved?: boolean | null;
      reservedBy?: string | null;
      reservationExpiry?: Date | null;
      isAvailable?: boolean;
    }
  ): Promise<ITimeSlot>;
  findSlotById(technicianId: string, slotId: string): Promise<ITimeSlot | null>;
  toggleSlotAvailability(slotId: string): Promise<ITimeSlot>;
  getSlotsByDate(technicianId: string, date: string): Promise<ITimeSlot[]>;
  findExpiredReservedSlots(now: Date): Promise<ITimeSlot[]>;
  findSlotsByIds(slotIds: string[]): Promise<ITimeSlot[]>;
}
