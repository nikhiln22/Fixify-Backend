import { IServiceController } from "../interfaces/Icontrollers/IserviceController";
import { HTTP_STATUS } from "../utils/httpStatus";
import { injectable, inject } from "tsyringe";
import { Request, Response } from "express";
import { IServiceService } from "../interfaces/Iservices/IserviceService";
import {
  createErrorResponse,
  createSuccessResponse,
} from "../utils/responseHelper";

@injectable()
export class ServiceController implements IServiceController {
  constructor(
    @inject("IServiceService")
    private _serviceService: IServiceService
  ) {}

  async addService(req: Request, res: Response): Promise<void> {
    try {
      console.log("adding the service by admin by the controller");
      const data = req.body;
      console.log("data:", data);
      console.log("req.file:", req.file);

      data.imageFile = req.file?.path;

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

      const serviceResponse = await this._serviceService.getAllServices({
        page,
        limit,
        search,
        categoryId,
        status,
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

  async addCategory(req: Request, res: Response): Promise<void> {
    try {
      console.log("entering to the admin adding the category");
      const name = req.body.name;

      if (!req.file) {
        res
          .status(HTTP_STATUS.BAD_REQUEST)
          .json(createErrorResponse("Image file is required"));
        return;
      }

      const serviceResponse = await this._serviceService.addCategory(
        name,
        req.file.path
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
              serviceResponse.message || "Failed to add category"
            )
          );
      }
    } catch (error) {
      console.log("error occurred while adding the category:", error);
      res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json(
          createErrorResponse("An error occurred while adding the category")
        );
    }
  }

  async getAllCategory(req: Request, res: Response): Promise<void> {
    try {
      console.log("entering to the function fetching all the categories");

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

      const serviceResponse = await this._serviceService.getAllCategories({
        page,
        limit,
        search,
        status,
      });

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
              serviceResponse.message || "Failed to fetch categories"
            )
          );
      }
    } catch (error) {
      console.error("Error in getAllCategory controller:", error);
      res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json(createErrorResponse("Error fetching categories data"));
    }
  }

  async toggleCategoryStatus(req: Request, res: Response): Promise<void> {
    try {
      console.log("entering to the toggle category status");
      const categoryId = req.params.categoryId;

      const serviceResponse = await this._serviceService.toggleCategoryStatus(
        categoryId
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
              serviceResponse.message || "Failed to toggle category status"
            )
          );
      }
    } catch (error) {
      console.error("Error occurred while toggling category status:", error);
      res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json(
          createErrorResponse(
            "An error occurred while toggling category status"
          )
        );
    }
  }

  async editCategory(req: Request, res: Response): Promise<void> {
    try {
      console.log("editing the category from the controller");
      const categoryId = req.params.categoryId;

      if (!categoryId) {
        res
          .status(HTTP_STATUS.BAD_REQUEST)
          .json(createErrorResponse("Category ID is required"));
        return;
      }

      const { name } = req.body;

      const updateData: { name?: string; image?: string } = {};

      if (name !== undefined) updateData.name = name;
      if (req.file) updateData.image = req.file.path;

      if (Object.keys(updateData).length === 0) {
        res
          .status(HTTP_STATUS.BAD_REQUEST)
          .json(createErrorResponse("No update data provided"));
        return;
      }

      const serviceResponse = await this._serviceService.updateCategory(
        categoryId,
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
              serviceResponse.message || "Failed to update category"
            )
          );
      }
    } catch (error) {
      console.error("Error occurred while editing category:", error);
      res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json(createErrorResponse("An error occurred while editing category"));
    }
  }
}
