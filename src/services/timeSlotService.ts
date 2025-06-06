import { ITimeSlotService } from "../interfaces/Iservices/ItimeSlotService";
import { ITimeSlotRepository } from "../interfaces/Irepositories/ItimeSlotRepository";
import { HTTP_STATUS } from "../utils/httpStatus";
import { inject, injectable } from "tsyringe";
import { ITimeSlot } from "../interfaces/Models/ItimeSlot";
import { AddTimeSlotsResult } from "../interfaces/DTO/IServices/ItechnicianService";

@injectable()
export class TimeSlotService implements ITimeSlotService {
  constructor(
    @inject("ITimeSlotRepository")
    private timeSlotRepository: ITimeSlotRepository
  ) {}

  async addTimeSlots(
    technicianId: string,
    data: {
      dateTimeSlots: Array<{
        date: Date;
        startTime: string;
        endTime: string;
      }>;
    }
  ): Promise<AddTimeSlotsResult> {
    try {
      console.log("entering the addslot function in the timeslot service");
      const { dateTimeSlots } = data;

      console.log(
        "dateTimeSlots in the timeslot service layer:",
        dateTimeSlots
      );
      console.log("technicianId:", technicianId);

      const generatedSlots: ITimeSlot[] = [];
      const slotDuration = 60;

      for (const slot of dateTimeSlots) {
        const { date, startTime, endTime } = slot;

        let slotDate: Date;
        if (typeof date === "string") {
          slotDate = new Date(date);
        } else {
          slotDate = new Date(date);
        }

        const year = slotDate.getFullYear();
        const month = (slotDate.getMonth() + 1).toString().padStart(2, "0");
        const day = slotDate.getDate().toString().padStart(2, "0");

        const dbDate = `${day}-${month}-${year}`;

        console.log(
          "Processing slot for date:",
          dbDate,
          "from",
          startTime,
          "to",
          endTime
        );

        const slotsForDate = await this.generateTimeSlotsForDate(
          technicianId,
          dbDate,
          startTime,
          endTime,
          slotDuration
        );

        generatedSlots.push(...slotsForDate);
      }

      console.log(
        "All generated slots in the time slot service layer:",
        generatedSlots
      );

      if (generatedSlots.length > 0) {
        return {
          success: true,
          message: "Timeslots created successfully",
          status: HTTP_STATUS.CREATED,
          data: generatedSlots,
        };
      } else {
        return {
          success: false,
          message:
            "No new timeslots were created (possible overlap with existing slots)",
          status: HTTP_STATUS.CONFLICT,
        };
      }
    } catch (error) {
      console.error("Error creating time slots:", error);
      if (error instanceof Error) {
        return {
          success: false,
          message: error.message,
          status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
        };
      } else {
        return {
          success: false,
          message: "An unknown error occurred while creating the timeslots",
          status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
        };
      }
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

      const exists = await this.timeSlotRepository.findSlot(
        technicianId,
        formattedDate,
        currentTimeStr,
        nextTimeStr
      );

      console.log(
        `Checking slot: ${formattedDate} ${currentTimeStr} - ${nextTimeStr}, exists: ${!!exists}`
      );

      if (!exists) {
        const createdSlot = await this.timeSlotRepository.newTimeslot(
          technicianId,
          formattedDate,
          currentTimeStr,
          nextTimeStr
        );

        const timeSlot = `${formattedDate} ${currentTimeStr} - ${nextTimeStr}`;
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

  async getTimeSlots(technicianId: string): Promise<{
    success: boolean;
    message: string;
    status: number;
    data?: ITimeSlot[];
  }> {
    try {
      console.log(
        "Fetching the timeSlots for the technician in the timeSlot Service"
      );

      const timeSlots = await this.timeSlotRepository.getTimeSlots(
        technicianId
      );
      console.log(
        "Response from the timeSlot repository getting timeSlots:",
        timeSlots
      );

      return {
        success: true,
        message: "Time slots fetched successfully",
        status: HTTP_STATUS.OK,
        data: timeSlots,
      };
    } catch (error) {
      console.error("Error fetching time slots in service:", error);
      return {
        success: false,
        message: "Failed to fetch time slots",
        status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
      };
    }
  }

  async blockTimeSlot(
    technicianId: string,
    slotId: string
  ): Promise<{
    success: boolean;
    message: string;
    status: number;
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

      const timeSlot = await this.timeSlotRepository.findSlotById(
        technicianId,
        slotId
      );

      if (!timeSlot) {
        return {
          success: false,
          message:
            "Time slot not found or you don't have permission to modify this slot",
          status: HTTP_STATUS.NOT_FOUND,
        };
      }

      if (timeSlot.isBooked) {
        return {
          success: false,
          message: "Cannot block/unblock a time slot that is already booked",
          status: HTTP_STATUS.BAD_REQUEST,
        };
      }

      const updatedSlot = await this.timeSlotRepository.toggleSlotAvailability(
        slotId
      );

      const action = updatedSlot.isAvailable ? "unblocked" : "blocked";

      return {
        success: true,
        message: `Time slot ${action} successfully`,
        status: HTTP_STATUS.OK,
        data: updatedSlot,
      };
    } catch (error) {
      console.error("Error in blockTimeSlot service:", error);
      return {
        success: false,
        message: "Failed to block/unblock time slot",
        status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
      };
    }
  }
}
