import { injectable, inject } from "tsyringe";
import { HTTP_STATUS } from "../utils/httpStatus";
import {
  createSuccessResponse,
  createErrorResponse,
} from "../utils/responseHelper";
import { IPartService } from "../interfaces/Iservices/IpartService";
import { Request, Response } from "express";

@injectable()
export class PartController {
  constructor(@inject("IPartService") private _partService: IPartService) {}

  async addPart(req: Request, res: Response): Promise<void> {
    try {
      console.log("entered to the controller function that adds the parts");
      const data = req.body;
      const serviceResponse = await this._partService.addPart(data);
      console.log("service response from the parts service:", serviceResponse);
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
            createErrorResponse(serviceResponse.message || "Failed to add part")
          );
      }
    } catch (error) {
      console.log("error occurred while adding the part:", error);
      res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json(createErrorResponse("An error occurred while adding the part"));
    }
  }

  async getAllParts(req: Request, res: Response): Promise<void> {
    try {
      console.log("function fetching all the parts");

      const page = req.query.page
        ? parseInt(req.query.page as string)
        : undefined;
      const limit = req.query.limit
        ? parseInt(req.query.limit as string)
        : undefined;
      const search = req.query.search
        ? (req.query.search as string)
        : undefined;
      const serviceId = req.query.serviceId
        ? (req.query.serviceId as string)
        : undefined;
      const status = req.query.status
        ? (req.query.status as string)
        : undefined;

      console.log("page in the parts fetching controller:", page);

      console.log("limit in the parts fetching controller:", limit);

      const serviceResponse = await this._partService.getAllParts({
        page,
        limit,
        search,
        serviceId,
        status,
      });

      console.log(
        "result from the fetching all parts controller:",
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
              serviceResponse.message || "Failed to fetch parts"
            )
          );
      }
    } catch (error) {
      console.error("Error in getAllParts controller:", error);
      res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json(createErrorResponse("Error fetching parts"));
    }
  }

  async togglePartStatus(req: Request, res: Response): Promise<void> {
    try {
      console.log("entering to the toggle part status");
      const partId = req.params.partId;

      const serviceResponse = await this._partService.togglePartStatus(partId);

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
              serviceResponse.message || "Failed to toggle part status"
            )
          );
      }
    } catch (error) {
      console.error("Error occurred while toggling part status:", error);
      res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json(
          createErrorResponse("An error occurred while toggling part status")
        );
    }
  }

  async updatePart(req: Request, res: Response): Promise<void> {
    try {
      console.log("entered to the controller function that updates the part");
      const partId = req.params.partId;
      const data = req.body;
      

      console.log("partId:", partId, "update data:", data);

      const serviceResponse = await this._partService.updatePart(partId, data);
      console.log("service response from the parts service:", serviceResponse);

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
              serviceResponse.message || "Failed to update part"
            )
          );
      }
    } catch (error) {
      console.log("error occurred while updating the part:", error);
      res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json(createErrorResponse("An error occurred while updating the part"));
    }
  }
}
