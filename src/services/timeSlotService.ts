import { ITimeSlotService } from "../interfaces/Iservices/ItimeSlotService";
import { ITimeSlotRepository } from "../interfaces/Irepositories/ItimeSlotRepository";
import { inject, injectable } from "tsyringe";
import { ITimeSlot } from "../interfaces/Models/ItimeSlot";
import { AddTimeSlotsResult } from "../interfaces/DTO/IServices/ItechnicianService";
import { Types } from "mongoose";

@injectable()
export class TimeSlotService implements ITimeSlotService {
  constructor(
    @inject("ITimeSlotRepository")
    private _timeSlotRepository: ITimeSlotRepository
  ) {}

  async addTimeSlots(
    technicianId: string,
    data: {
      dateTimeSlots: Array<{
        date: string;
        startTime: string;
        endTime: string;
      }>;
    }
  ): Promise<AddTimeSlotsResult> {
    try {
      console.log("entering the addslot function in the timeslot service");
      const { dateTimeSlots } = data;

      for (const slot of dateTimeSlots) {
        const { date, startTime, endTime } = slot;

        const overlappingSlots =
          await this._timeSlotRepository.findOverlappingSlots(
            technicianId,
            date,
            startTime,
            endTime
          );

        if (overlappingSlots.length > 0) {
          const existingSlot = overlappingSlots[0];
          return {
            success: false,
            message: `Time slot conflict detected. You already have availability from ${existingSlot.startTime} to ${existingSlot.endTime} on ${date}. Please choose a different time or date.`,
          };
        }
      }

      const generatedSlots: ITimeSlot[] = [];
      const slotDuration = 30;

      for (const slot of dateTimeSlots) {
        const { date, startTime, endTime } = slot;

        const slotsForDate = await this.generateTimeSlotsForDate(
          technicianId,
          date,
          startTime,
          endTime,
          slotDuration
        );

        generatedSlots.push(...slotsForDate);
      }

      if (generatedSlots.length > 0) {
        return {
          success: true,
          message: "Timeslots created successfully",
          data: generatedSlots,
        };
      } else {
        return {
          success: false,
          message: "No new timeslots were created",
        };
      }
    } catch (error) {
      console.error("Error creating time slots:", error);
      return {
        success: false,
        message:
          error instanceof Error ? error.message : "An unknown error occurred",
      };
    }
  }

  private async generateTimeSlotsForDate(
    technicianId: string,
    date: string,
    startTime: string,
    endTime: string,
    slotDuration: number
  ): Promise<ITimeSlot[]> {
    const slots: ITimeSlot[] = [];

    const formattedDate = date;

    console.log(
      "formattedDate in the generateTimeSlotsForDate helper function in the timeslot service layer:",
      formattedDate
    );

    const startMinutes = this.timeStringToMinutes(startTime);

    console.log(
      "startMinutes in the generateTimeSlotsForDate helper function in the timeslot service layer:",
      startMinutes
    );

    const endMinutes = this.timeStringToMinutes(endTime);

    console.log(
      "endMinutes in the generateTimeSlotsForDate helper function in the timeslot service layer:",
      endMinutes
    );

    let currentMinutes = startMinutes;

    while (currentMinutes < endMinutes) {
      const nextMinutes = currentMinutes + slotDuration;

      if (nextMinutes > endMinutes) {
        break;
      }

      const currentTimeStr = this.minutesToTimeString(currentMinutes);
      const nextTimeStr = this.minutesToTimeString(nextMinutes);

      const exists = await this._timeSlotRepository.findSlot(
        technicianId,
        formattedDate,
        currentTimeStr,
        nextTimeStr
      );

      console.log(
        `Checking slot: ${formattedDate} ${currentTimeStr} - ${nextTimeStr}, exists: ${!!exists}`
      );

      if (!exists) {
        const createdSlot = await this._timeSlotRepository.newTimeslot(
          technicianId,
          formattedDate,
          currentTimeStr,
          nextTimeStr
        );

        slots.push(createdSlot);
      }

      currentMinutes += slotDuration;
    }

    return slots;
  }

  private timeStringToMinutes(timeStr: string): number {
    const time12HourRegex = /^(\d{1,2}):(\d{2})\s*(AM|PM)$/i;
    const time24HourRegex = /^(\d{1,2}):(\d{2})$/;

    let hours: number;
    let minutes: number;

    if (time12HourRegex.test(timeStr)) {
      const match = timeStr.match(time12HourRegex);
      if (!match) return 0;

      hours = parseInt(match[1]);
      minutes = parseInt(match[2]);
      const period = match[3].toUpperCase();

      if (period === "AM" && hours === 12) {
        hours = 0;
      } else if (period === "PM" && hours !== 12) {
        hours += 12;
      }
    } else if (time24HourRegex.test(timeStr)) {
      const match = timeStr.match(time24HourRegex);
      if (!match) return 0;

      hours = parseInt(match[1]);
      minutes = parseInt(match[2]);
    } else {
      return 0;
    }

    return hours * 60 + minutes;
  }

  private minutesToTimeString(minutes: number): string {
    const totalHours = Math.floor(minutes / 60);
    const mins = minutes % 60;

    let displayHour = totalHours;
    let period = "AM";

    if (totalHours === 0) {
      displayHour = 12;
    } else if (totalHours === 12) {
      displayHour = 12;
      period = "PM";
    } else if (totalHours > 12) {
      displayHour = totalHours - 12;
      period = "PM";
    }

    return `${displayHour}:${mins.toString().padStart(2, "0")} ${period}`;
  }

  async getTimeSlots(
    technicianId: string,
    includePast: boolean,
    additionalFilters?: { [key: string]: string | number | boolean | Date }
  ): Promise<{
    success: boolean;
    message: string;
    data?: ITimeSlot[];
  }> {
    try {
      console.log(
        "Fetching the timeSlots for the technician in the timeSlot Service"
      );

      const timeSlots = await this._timeSlotRepository.getTimeSlots(
        technicianId,
        includePast,
        additionalFilters
      );
      console.log(
        "Response from the timeSlot repository getting timeSlots:",
        timeSlots
      );

      return {
        success: true,
        message: "Time slots fetched successfully",
        data: timeSlots,
      };
    } catch (error) {
      console.error("Error fetching time slots in service:", error);
      return {
        success: false,
        message: "Failed to fetch time slots",
      };
    }
  }

  async blockTimeSlot(
    technicianId: string,
    slotId: string
  ): Promise<{
    success: boolean;
    message: string;
    data?: ITimeSlot;
  }> {
    try {
      console.log("entering the timeslot service which blocks the timeslot");
      console.log(
        "technicianId in the timeslot service which blocks the timeslot:",
        technicianId
      );
      console.log(
        "slotId in the timeslot service which blocks the timeslot:",
        slotId
      );

      const timeSlot = await this._timeSlotRepository.findSlotById(
        technicianId,
        slotId
      );

      if (!timeSlot) {
        return {
          success: false,
          message:
            "Time slot not found or you don't have permission to modify this slot",
        };
      }

      if (timeSlot.isBooked) {
        return {
          success: false,
          message: "Cannot block/unblock a time slot that is already booked",
        };
      }

      const updatedSlot = await this._timeSlotRepository.toggleSlotAvailability(
        slotId
      );

      const action = updatedSlot.isAvailable ? "unblocked" : "blocked";

      return {
        success: true,
        message: `Time slot ${action} successfully`,
        data: updatedSlot,
      };
    } catch (error) {
      console.error("Error in blockTimeSlot service:", error);
      return {
        success: false,
        message: "Failed to block/unblock time slot",
      };
    }
  }

  async updateSlotBookingStatus(
    technicianId: string,
    slotId: string,
    isBooked: boolean
  ): Promise<{
    success: boolean;
    message: string;
    data?: ITimeSlot;
  }> {
    try {
      console.log(
        `TimeSlotService: Updating slot ${slotId} for technician ${technicianId} booking status to:`,
        isBooked
      );

      const updatedSlot =
        await this._timeSlotRepository.updateSlotBookingStatus(
          technicianId,
          slotId,
          { isBooked }
        );

      const action = isBooked ? "booked" : "unbooked";

      return {
        success: true,
        message: `Time slot ${action} successfully`,
        data: updatedSlot,
      };
    } catch (error) {
      console.error("Error in updateSlotBookingStatus service:", error);
      return {
        success: false,
        message: "Failed to update slot booking status",
      };
    }
  }

  async blockMultipleSlotsForService(
    technicianId: string,
    startTimeSlotId: string,
    serviceDurationMinutes: number
  ): Promise<{
    success: boolean;
    message: string;
    blockedSlots?: string[];
  }> {
    try {
      const startSlot = await this._timeSlotRepository.findSlotById(
        technicianId,
        startTimeSlotId
      );

      if (!startSlot) {
        return { success: false, message: "Starting time slot not found" };
      }

      const slotsNeeded = Math.ceil(serviceDurationMinutes / 30);

      const allSlots = await this._timeSlotRepository.getSlotsByDate(
        technicianId,
        startSlot.date
      );

      const startIndex = allSlots.findIndex(
        (slot) => slot._id.toString() === startTimeSlotId
      );

      if (startIndex === -1) {
        return {
          success: false,
          message: "Could not find starting slot position",
        };
      }

      const slotsToBlock = allSlots.slice(startIndex, startIndex + slotsNeeded);

      if (slotsToBlock.length < slotsNeeded) {
        return {
          success: false,
          message: "Not enough consecutive time slots available",
        };
      }

      const alreadyBooked = slotsToBlock.find(
        (slot) => slot.isBooked || !slot.isAvailable
      );
      if (alreadyBooked) {
        return {
          success: false,
          message: "Some required time slots are not available",
        };
      }

      const blockedSlotIds: string[] = [];
      for (const slot of slotsToBlock) {
        await this.updateSlotBookingStatus(
          technicianId,
          slot._id.toString(),
          true
        );
        blockedSlotIds.push(slot._id.toString());
      }

      return {
        success: true,
        message: `Blocked ${blockedSlotIds.length} slots for service`,
        blockedSlots: blockedSlotIds,
      };
    } catch (error) {
      console.log(
        "error occured while blocking the multiple time slots:",
        error
      );
      return { success: false, message: "Failed to block time slots" };
    }
  }

  async unblockMultipleSlots(
    technicianId: string,
    slotIds: string[]
  ): Promise<{
    success: boolean;
    message: string;
  }> {
    try {
      console.log(
        `Unblocking ${slotIds.length} slots for technician ${technicianId}`
      );

      let unblockedCount = 0;
      for (const slotId of slotIds) {
        const result = await this.updateSlotBookingStatus(
          technicianId,
          slotId,
          false
        );

        if (result.success) {
          unblockedCount++;
        }
      }

      return {
        success: unblockedCount > 0,
        message: `Successfully unblocked ${unblockedCount} out of ${slotIds.length} time slots`,
      };
    } catch (error) {
      console.error("Error unblocking multiple slots:", error);
      return {
        success: false,
        message: "Failed to unblock time slots",
      };
    }
  }

  async reserveTimeSlot(
    technicianId: string,
    slotId: string,
    userId: string,
    durationInMinutes: number
  ): Promise<{
    success: boolean;
    message: string;
    reservedSlots?: string[];
  }> {
    try {
      const startSlot = await this._timeSlotRepository.findSlotById(
        technicianId,
        slotId
      );
      if (!startSlot) {
        return {
          success: false,
          message: "Selected start time slot not found.",
        };
      }

      const slotsNeeded = Math.ceil(durationInMinutes / 30);

      const allSlots = await this._timeSlotRepository.getSlotsByDate(
        technicianId,
        startSlot.date
      );

      const startIndex = allSlots.findIndex((s) => s._id.toString() === slotId);

      if (startIndex === -1) {
        return { success: false, message: "Invalid starting slot selected." };
      }

      const slotsToReserve = allSlots.slice(
        startIndex,
        startIndex + slotsNeeded
      );
      if (slotsToReserve.length < slotsNeeded) {
        return {
          success: false,
          message:
            "Not enough consecutive slots available for this service duration. Please choose another time.",
        };
      }

      const unavailableSlot = slotsToReserve.find((s) => {
        const now = new Date();
        return (
          s.isBooked ||
          (s.isReserved &&
            s.reservedBy?.toString() !== userId &&
            s.reservationExpiry &&
            s.reservationExpiry > now)
        );
      });

      if (unavailableSlot) {
        return {
          success: false,
          message:
            "The selected time slot or one of the consecutive slots is already reserved or booked. Please choose another time.",
        };
      }

      const reservationExpiry = new Date(Date.now() + 5 * 60 * 1000);

      for (const slot of slotsToReserve) {
        await this._timeSlotRepository.updateSlotBookingStatus(
          technicianId,
          slot._id.toString(),
          {
            isReserved: true,
            reservedBy: userId,
            reservationExpiry,
          }
        );
      }

      return {
        success: true,
        message: `Successfully reserved ${slotsToReserve.length} consecutive slots.`,
        reservedSlots: slotsToReserve.map((s) => s._id.toString()),
      };
    } catch (error) {
      console.error("Error reserving slots:", error);
      return {
        success: false,
        message: "An unexpected error occurred while reserving time slots.",
      };
    }
  }

  async releaseReservedSlots(
    technicianId: string,
    slotIds: string[]
  ): Promise<{ success: boolean; message: string }> {
    try {
      if (!slotIds || slotIds.length === 0) {
        return { success: false, message: "No slots provided to release" };
      }

      for (const slotId of slotIds) {
        await this._timeSlotRepository.updateSlotBookingStatus(
          technicianId,
          slotId,
          {
            isReserved: false,
            reservedBy: null,
            reservationExpiry: null,
          }
        );
      }

      return { success: true, message: "Reserved slots released successfully" };
    } catch (error) {
      console.error("Error releasing reserved slots:", error);
      return { success: false, message: "Failed to release reserved slots" };
    }
  }

  async confirmReservedSlots(
    technicianId: string,
    userId: string,
    slotIds: string[]
  ): Promise<string[]> {
    try {
      if (!slotIds || slotIds.length === 0) return [];

      const slots = await this._timeSlotRepository.findSlotsByIds(slotIds);

      if (!slots) {
        return [];
      }

      const userReservedSlots = slots.filter(
        (slot) => slot.reservedBy === new Types.ObjectId(userId)
      );

      for (const slot of userReservedSlots) {
        await this._timeSlotRepository.updateSlotBookingStatus(
          technicianId,
          slot._id.toString(),
          {
            isBooked: true,
            isReserved: false,
            reservedBy: null,
            reservationExpiry: null,
          }
        );
      }

      return userReservedSlots.map((s) => s._id.toString());
    } catch (error) {
      console.error("Error confirming reserved slots:", error);
      return [];
    }
  }
}
