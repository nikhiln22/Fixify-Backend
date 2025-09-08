import { Request, Response } from "express";
import { inject, injectable } from "tsyringe";
import { ITimeSlotService } from "../interfaces/Iservices/ItimeSlotService";
import { HTTP_STATUS } from "../utils/httpStatus";
import {
  createErrorResponse,
  createSuccessResponse,
} from "../utils/responseHelper";
import { AuthenticatedRequest } from "../middlewares/AuthMiddleware";

@injectable()
export class TimeSlotController {
  constructor(
    @inject("ITimeSlotService") private _timeSlotService: ITimeSlotService
  ) {}

  async getTimeSlots(req: Request, res: Response): Promise<void> {
    try {
      console.log("finding the time slots for the user");
      const technicianId = req.params.technicianId;
      const includePast = req.query.includePast === "true";
      console.log("technicianId in the user controller:", technicianId);

      const userFilters = {
        isAvailable: true,
        isBooked: false,
      };

      const serviceResponse = await this._timeSlotService.getTimeSlots(
        technicianId,
        includePast,
        userFilters
      );
      console.log(
        "response from the get time slots user controller:",
        serviceResponse
      );

      if (serviceResponse.success) {
        res
          .status(HTTP_STATUS.OK)
          .json(
            createSuccessResponse(serviceResponse.data, serviceResponse.message)
          );
      } else {
        res
          .status(HTTP_STATUS.BAD_REQUEST)
          .json(
            createErrorResponse(
              serviceResponse.message || "Failed to fetch time slots"
            )
          );
      }
    } catch (error) {
      console.log(
        "error occurred while fetching the time slots for the user",
        error
      );
      res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json(createErrorResponse("Internal Server Error"));
    }
  }

  async addTimeSlots(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      console.log(
        "adding the time slots by the technician in time slot function"
      );
      const technicianId = req.user?.id;
      const data = req.body;
      console.log("data in the addtime slot controller:", data);
      console.log("technicianId from the addtimeslot function:", technicianId);

      if (!technicianId) {
        res
          .status(HTTP_STATUS.UNAUTHORIZED)
          .json(createErrorResponse("Unauthorized access"));
        return;
      }

      const serviceResponse = await this._timeSlotService.addTimeSlots(
        technicianId,
        data
      );
      console.log(
        "response from the technician controller adding time Slots:",
        serviceResponse
      );

      if (serviceResponse.success) {
        res
          .status(HTTP_STATUS.CREATED)
          .json(
            createSuccessResponse(serviceResponse.data, serviceResponse.message)
          );
      } else {
        res
          .status(HTTP_STATUS.BAD_REQUEST)
          .json(
            createErrorResponse(
              serviceResponse.message || "Failed to add time slots"
            )
          );
      }
    } catch (error) {
      console.log("error occurred while adding the time slots:", error);
      res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json(createErrorResponse("Internal Server error"));
    }
  }

  async blockTimeSlot(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      console.log(
        "entering the technician controller function that makes the released slots unavailable"
      );
      const technicianId = req.user?.id;
      console.log(
        "technicianId in the blocktime slots function:",
        technicianId
      );
      const slotId = req.params.slotId;
      console.log("slotId in the blocktime slots function:", slotId);

      if (!technicianId) {
        res
          .status(HTTP_STATUS.UNAUTHORIZED)
          .json(createErrorResponse("Unauthorized access"));
        return;
      }

      const serviceResponse = await this._timeSlotService.blockTimeSlot(
        technicianId,
        slotId
      );
      console.log("response from the blockslotId Service:", serviceResponse);

      if (serviceResponse.success) {
        res
          .status(HTTP_STATUS.OK)
          .json(
            createSuccessResponse(serviceResponse.data, serviceResponse.message)
          );
      } else {
        const statusCode = serviceResponse.message?.includes("not found")
          ? HTTP_STATUS.NOT_FOUND
          : HTTP_STATUS.BAD_REQUEST;
        res
          .status(statusCode)
          .json(
            createErrorResponse(
              serviceResponse.message || "Failed to block time slot"
            )
          );
      }
    } catch (error) {
      console.log("error occurred while blocking the slots:", error);
      res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json(createErrorResponse("Internal Server Error"));
    }
  }
}
