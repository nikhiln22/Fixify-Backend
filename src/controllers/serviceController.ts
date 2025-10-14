import { HTTP_STATUS } from "../constants/httpStatus";
import { injectable, inject } from "tsyringe";
import { Request, Response } from "express";
import { IServiceService } from "../interfaces/Iservices/IserviceService";
import {
  createErrorResponse,
  createSuccessResponse,
} from "../utils/responseHelper";
import { IBookingService } from "../interfaces/Iservices/IbookingService";

@injectable()
export class ServiceController {
  constructor(
    @inject("IServiceService")
    private _serviceService: IServiceService,
    @inject("IBookingService") private _bookingService: IBookingService
  ) {}

  async addService(req: Request, res: Response): Promise<void> {
    try {
      console.log("adding the service by admin by the controller");
      const data = req.body;
      console.log("data:", data);
      console.log("req.file:", req.file);

      data.image = req.file?.path;

      const serviceResponse = await this._serviceService.addService(data);
      console.log("result from the addservice function:", serviceResponse);

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
              serviceResponse.message || "Failed to add service"
            )
          );
      }
    } catch (error) {
      console.log("error occurred while adding the service:", error);
      res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json(
          createErrorResponse("An error occurred while adding the service")
        );
    }
  }

  async getAllServices(req: Request, res: Response): Promise<void> {
    try {
      console.log("function fetching all the services");

      const page = req.query.page
        ? parseInt(req.query.page as string)
        : undefined;
      const limit = req.query.limit
        ? parseInt(req.query.limit as string)
        : undefined;
      const search = req.query.search
        ? (req.query.search as string)
        : undefined;
      const categoryId = req.query.categoryId
        ? (req.query.categoryId as string)
        : undefined;
      const status = req.query.status
        ? (req.query.status as string)
        : undefined;
      const serviceType = req.query.serviceType
        ? (req.query.serviceType as string)
        : undefined;

      const serviceResponse = await this._serviceService.getAllServices({
        page,
        limit,
        search,
        categoryId,
        status,
        serviceType
      });

      console.log(
        "result from the fetching all services controller:",
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
              serviceResponse.message || "Failed to fetch services"
            )
          );
      }
    } catch (error) {
      console.error("Error in getAllServices controller:", error);
      res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json(createErrorResponse("Error fetching services"));
    }
  }

  async toggleServiceStatus(req: Request, res: Response): Promise<void> {
    try {
      console.log("entering to the toggle service status");
      const serviceId = req.params.serviceId;

      const serviceResponse = await this._serviceService.toggleServiceStatus(
        serviceId
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
              serviceResponse.message || "Failed to toggle service status"
            )
          );
      }
    } catch (error) {
      console.error("Error occurred while toggling service status:", error);
      res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json(
          createErrorResponse("An error occurred while toggling service status")
        );
    }
  }

  async editService(req: Request, res: Response): Promise<void> {
    try {
      console.log("editing the service from the controller");
      const serviceId = req.params.serviceId;

      if (!serviceId) {
        res
          .status(HTTP_STATUS.BAD_REQUEST)
          .json(createErrorResponse("Service ID is required"));
        return;
      }

      const { name, description, price, categoryId } = req.body;

      const updateData: {
        name?: string;
        image?: string;
        description?: string;
        price?: number;
        categoryId?: string;
      } = {};

      if (name !== undefined) updateData.name = name;
      if (description !== undefined) updateData.description = description;
      if (categoryId !== undefined) updateData.categoryId = categoryId;
      if (price !== undefined) updateData.price = price;
      if (req.file) updateData.image = req.file.path;

      if (Object.keys(updateData).length === 0) {
        res
          .status(HTTP_STATUS.BAD_REQUEST)
          .json(createErrorResponse("No update data provided"));
        return;
      }

      const serviceResponse = await this._serviceService.updateService(
        serviceId,
        updateData
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
              serviceResponse.message || "Failed to update service"
            )
          );
      }
    } catch (error) {
      console.error("Error occurred while editing service:", error);
      res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json(createErrorResponse("An error occurred while editing service"));
    }
  }

  async getServiceDetails(req: Request, res: Response): Promise<void> {
    try {
      console.log("fetching the service details for the user");
      const serviceId = req.params.serviceId;
      console.log("serviceId in the user controller:", serviceId);

      const serviceResponse = await this._serviceService.getServiceDetails(
        serviceId
      );
      console.log("response in the user controller:", serviceResponse);

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
              serviceResponse.message || "Failed to fetch service details"
            )
          );
      }
    } catch (error) {
      console.log(
        "error occurred while fetching the service details for the user:",
        error
      );
      res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json(createErrorResponse("Internal Server Error"));
    }
  }

  async getMostBookedServices(req: Request, res: Response): Promise<void> {
    try {
      console.log(
        "fetching the most booked services for the user in user controller"
      );
      const limit = parseInt(req.query.limit as string) || undefined;
      const days = parseInt(req.query.days as string) || undefined;

      const serviceResponse = await this._bookingService.getMostBookedServices(
        limit,
        days
      );
      console.log("response from getMostBookedServices:", serviceResponse);

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
              serviceResponse.message || "Failed to fetch most booked services"
            )
          );
      }
    } catch (error) {
      console.log("error occurred while fetching most booked services:", error);
      res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json(createErrorResponse("Internal Server Error"));
    }
  }
}
