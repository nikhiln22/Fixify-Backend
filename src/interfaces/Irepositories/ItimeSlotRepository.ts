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
    isBooked: boolean
  ): Promise<ITimeSlot>;
  findSlotById(technicianId: string, slotId: string): Promise<ITimeSlot | null>;
  toggleSlotAvailability(slotId: string): Promise<ITimeSlot>;
  getSlotsByDate(technicianId: string, date: string): Promise<ITimeSlot[]>;
}
