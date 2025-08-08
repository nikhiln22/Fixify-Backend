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

  async findOverlappingSlots(
    technicianId: string,
    date: string,
    startTime: string,
    endTime: string
  ): Promise<ITimeSlot[]> {
    try {
      console.log("Checking for overlapping slots on date:", date);

      const filter = {
        technicianId: new Types.ObjectId(technicianId),
        date: date,
      };

      const existingSlotsOnDate = await this.findAll(filter);

      if (existingSlotsOnDate.length === 0) {
        return [];
      }

      const newStartMinutes = this.timeStringToMinutes(startTime);
      const newEndMinutes = this.timeStringToMinutes(endTime);

      const overlappingSlots = existingSlotsOnDate.filter((slot) => {
        if (!slot.startTime || !slot.endTime) {
          console.warn("Slot missing start or end time:", slot);
          return false;
        }

        const existingStartMinutes = this.timeStringToMinutes(slot.startTime);
        const existingEndMinutes = this.timeStringToMinutes(slot.endTime);

        return (
          newStartMinutes < existingEndMinutes &&
          newEndMinutes > existingStartMinutes
        );
      });

      console.log("Found overlapping slots:", overlappingSlots.length);
      return overlappingSlots;
    } catch (error) {
      console.error("Error finding overlapping slots:", error);
      throw error;
    }
  }

  private timeStringToMinutes(timeStr: string): number {
    const time12HourRegex = /^(\d{1,2}):(\d{2})\s*(AM|PM)$/i;

    const match = timeStr.match(time12HourRegex);
    if (!match) return 0;

    let hours = parseInt(match[1]);
    const minutes = parseInt(match[2]);
    const period = match[3].toUpperCase();

    if (period === "AM" && hours === 12) {
      hours = 0;
    } else if (period === "PM" && hours !== 12) {
      hours += 12;
    }

    return hours * 60 + minutes;
  }

  async getTimeSlots(
    technicianId: string,
    includePast: boolean,
    additionalFilters?: { [key: string]: string | number | boolean | Date }
  ): Promise<ITimeSlot[]> {
    try {
      console.log(
        "Fetching time slots from repository for technician:",
        technicianId
      );

      const filter = {
        technicianId: new Types.ObjectId(technicianId),
      };

      if (additionalFilters) {
        Object.assign(filter, additionalFilters);
      }

      const allSlots = (await this.find(filter, {
        sort: { date: 1, startTime: 1 },
      })) as ITimeSlot[];

      if (!includePast) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const now = new Date();
        const currentTime = now.getHours() * 60 + now.getMinutes();
        const todayDateString = `${String(now.getDate()).padStart(
          2,
          "0"
        )}-${String(now.getMonth() + 1).padStart(2, "0")}-${now.getFullYear()}`;

        const filteredSlots = allSlots.filter((slot) => {
          const [day, month, year] = slot.date.split("-");
          const slotDate = new Date(
            parseInt(year),
            parseInt(month) - 1,
            parseInt(day)
          );
          slotDate.setHours(0, 0, 0, 0);

          // Skip past dates (before today)
          if (slotDate < today) return false;

          // For today's slots - show ALL slots if no additionalFilters (technician view)
          // Only filter by time if additionalFilters exist (user view)
          if (slot.date === todayDateString) {
            if (!slot.startTime) return false;

            // If additionalFilters exist, it's a user request - filter past times
            if (
              additionalFilters &&
              Object.keys(additionalFilters).length > 0
            ) {
              const slotTimeInMinutes = this.timeStringToMinutes(
                slot.startTime
              );
              return slotTimeInMinutes > currentTime;
            }

            // No additionalFilters means technician request - show all today's slots
            return true;
          }

          return true;
        });

        return filteredSlots;
      }

      return allSlots;
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

  async updateSlotBookingStatus(
    technicianId: string,
    slotId: string,
    isBooked: boolean
  ): Promise<ITimeSlot> {
    try {
      console.log(
        `Updating booking status for slot ID: ${slotId}, technician: ${technicianId} to ${isBooked}`
      );

      const currentSlot = await this.findSlotById(technicianId, slotId);
      if (!currentSlot) {
        throw new Error(
          "Time slot not found or you don't have permission to modify this slot"
        );
      }

      if (currentSlot.isBooked === isBooked) {
        const action = isBooked ? "already booked" : "already unbooked";
        throw new Error(`Time slot is ${action}`);
      }

      if (isBooked && !currentSlot.isAvailable) {
        throw new Error("Time slot is not available for booking");
      }

      const updatedSlot = await this.updateOne(
        {
          _id: new Types.ObjectId(slotId),
          technicianId: new Types.ObjectId(technicianId),
        },
        {
          isBooked: isBooked,
          isAvailable: !isBooked,
        }
      );

      if (!updatedSlot) {
        throw new Error("Failed to update time slot booking status");
      }

      console.log("Updated slot booking status:", updatedSlot);
      return updatedSlot;
    } catch (error) {
      console.error("Error updating slot booking status:", error);
      throw error;
    }
  }
}
