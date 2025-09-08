import { Request, Response } from "express";
import { injectable, inject } from "tsyringe";
import { IJobsService } from "../interfaces/Iservices/IjobsService";
import { HTTP_STATUS } from "../utils/httpStatus";
import {
  createErrorResponse,
  createSuccessResponse,
} from "../utils/responseHelper";

@injectable()
export class JobController {
  constructor(
    @inject("IJobsService")
    private _jobService: IJobsService
  ) {}

  async addDesignation(req: Request, res: Response): Promise<void> {
    try {
      const { designation } = req.body;

      const serviceResponse = await this._jobService.addDesignation(
        designation
      );
      console.log("result in the adddesignation controller:", serviceResponse);

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
              serviceResponse.message || "Failed to add designation"
            )
          );
      }
    } catch (error) {
      console.error("Error adding designation:", error);
      res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json(createErrorResponse("Error adding designation"));
    }
  }

  async toggleDesignationStatus(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      console.log("id from the toggle designation control:", id);

      const serviceResponse = await this._jobService.toggleDesignationStatus(
        id
      );

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
              serviceResponse.message || "Failed to toggle designation status"
            )
          );
      }
    } catch (error) {
      console.error("Error toggling designation status:", error);
      res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json(createErrorResponse("Error toggling designation status"));
    }
  }

  async getAllDesignations(req: Request, res: Response): Promise<void> {
    try {
      console.log("function fetching all the job designations");
      const page = req.query.page
        ? parseInt(req.query.page as string)
        : undefined;
      const limit = req.query.limit
        ? parseInt(req.query.limit as string)
        : undefined;
      const search = req.query.search
        ? (req.query.search as string)
        : undefined;
      const status = req.query.status
        ? (req.query.status as string)
        : undefined;

      const serviceResponse = await this._jobService.getAllDesignations({
        page,
        limit,
        search,
        status,
      });

      console.log(
        "result from the fetching all designations controller:",
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
              serviceResponse.message || "Failed to fetch designations"
            )
          );
      }
    } catch (error) {
      console.error("Error in getAllDesignations controller:", error);
      res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json(createErrorResponse("Error fetching designations"));
    }
  }
}
