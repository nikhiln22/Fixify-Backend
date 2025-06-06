import { ITimeSlotRepository } from "../interfaces/Irepositories/ItimeSlotRepository";
import { injectable } from "tsyringe";
import { ITimeSlot } from "../interfaces/Models/ItimeSlot";
import timeSlot from "../models/timeSlotModel";
import { BaseRepository } from "./baseRepository";
import { Types } from "mongoose";

@injectable()
export class TimeSlotRepository
  extends BaseRepository<ITimeSlot>
  implements ITimeSlotRepository
{
  constructor() {
    super(timeSlot);
  }

  async findSlot(
    technicianId: string,
    date: string,
    startTime: string,
    endTime: string
  ): Promise<ITimeSlot | null> {
    try {
      console.log(
        "entering the time slot repository for finding the existing slots"
      );

      const filter = {
        technicianId: new Types.ObjectId(technicianId),
        date,
        startTime,
        endTime,
      };

      const existingSlot = await this.findOne(filter);

      console.log("Found existing slot:", existingSlot);
      return existingSlot;
    } catch (error) {
      console.error("Error finding time slot:", error);
      throw error;
    }
  }

  async newTimeslot(
    technicianId: string,
    date: string,
    startTime: string,
    endTime: string
  ): Promise<ITimeSlot> {
    try {
      console.log("Creating new time slot");

      const timeSlotData = {
        technicianId: new Types.ObjectId(technicianId),
        date,
        startTime,
        endTime,
      };

      const newSlot = await this.create(timeSlotData);

      console.log("Created new time slot:", newSlot);
      return newSlot;
    } catch (error) {
      console.error("Error creating new time slot:", error);
      throw error;
    }
  }

  async getTimeSlots(technicianId: string): Promise<ITimeSlot[]> {
    try {
      console.log(
        "Fetching time slots from repository for technician:",
        technicianId
      );

      const filter = {
        technicianId: new Types.ObjectId(technicianId),
      };

      const timeSlots = (await this.find(filter, {
        sort: { date: 1, startTime: 1 },
      })) as ITimeSlot[];

      console.log("Found time slots in repository:", timeSlots.length);
      return timeSlots;
    } catch (error) {
      console.error("Error fetching time slots from repository:", error);
      throw error;
    }
  }

  async findSlotById(
    technicianId: string,
    slotId: string
  ): Promise<ITimeSlot | null> {
    try {
      console.log("Finding time slot by ID and technician ID");

      const filter = {
        _id: new Types.ObjectId(slotId),
        technicianId: new Types.ObjectId(technicianId),
      };

      const slot = await this.findOne(filter);
      console.log("Found slot by ID:", slot);
      return slot;
    } catch (error) {
      console.error("Error finding time slot by ID:", error);
      throw error;
    }
  }

  async toggleSlotAvailability(slotId: string): Promise<ITimeSlot> {
    try {
      console.log("Toggling availability for slot ID:", slotId);

      const currentSlot = await this.findById(slotId);
      if (!currentSlot) {
        throw new Error("Time slot not found");
      }

      const newAvailabilityStatus = !currentSlot.isAvailable;

      const updatedSlot = await this.updateOne(
        { _id: new Types.ObjectId(slotId) },
        { isAvailable: newAvailabilityStatus }
      );

      if (!updatedSlot) {
        throw new Error("Failed to update time slot");
      }

      console.log("Updated slot availability:", updatedSlot);
      return updatedSlot;
    } catch (error) {
      console.error("Error toggling slot availability:", error);
      throw error;
    }
  }
}
