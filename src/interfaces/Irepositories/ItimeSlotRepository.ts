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
  getTimeSlots(technicianId: string): Promise<ITimeSlot[]>;
  findSlotById(technicianId: string, slotId: string): Promise<ITimeSlot | null>;
  toggleSlotAvailability(slotId: string): Promise<ITimeSlot>
}
