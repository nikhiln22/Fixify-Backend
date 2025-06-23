import { IserviceController } from "../interfaces/Icontrollers/IserviceController";
import { HTTP_STATUS } from "../utils/httpStatus";
import { injectable, inject } from "tsyringe";
import { Request, Response } from "express";
import { IServiceService } from "../interfaces/Iservices/IserviceService";

@injectable()
export class ServiceController implements IserviceController {
  constructor(
    @inject("IServiceService")
    private serviceService: IServiceService
  ) {}

  async addService(req: Request, res: Response): Promise<void> {
    try {
      console.log("adding the service by admin by the controller");
      const data = req.body;
      console.log("data:",data);
      console.log("req.file:",req.file);
      data.imageFile = req.file?.path;
      let result = await this.serviceService.addService(data);
      console.log("result from the addservice function:", result);
      res.status(result.status).json({
        success: result.success,
        message: result.message,
        data: result.data,
      });
    } catch (error) {
      console.log("error occured while adding the category:", error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: "An error occured while adding the category",
      });
    }
  }

  async getAllServices(req: Request, res: Response): Promise<void> {
    try {
      console.log("function fetching all the services");

      const page = parseInt(req.query.page as string) || undefined;
      const limit = parseInt(req.query.limit as string) || undefined;
      const search = (req.query.search as string) || undefined;
      const categoryId = (req.query.category as string) || undefined;
      const status = (req.query.status as string) || undefined;

      const result = await this.serviceService.getAllServices({
        page,
        limit,
        search,
        categoryId,
        status,
      });

      console.log("result from the fetching all services controller:", result);

      res.status(result.status).json(result);
    } catch (error) {
      console.error("Error in getAllServices controller:", error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: "Error fetching services",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  async toggleServiceStatus(req: Request, res: Response): Promise<void> {
    try {
      console.log("entering to the toggle service status");
      const serviceId = req.params.serviceId;

      const result = await this.serviceService.toggleServiceStatus(serviceId);

      res.status(result.status).json({
        success: result.success,
        message: result.message,
        data: result.data,
      });
    } catch (error) {
      console.error("Error occurred while toggling category status:", error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: "An error occurred while toggling category status",
      });
    }
  }

  async editService(req: Request, res: Response): Promise<void> {
    try {
      console.log("editing the service from the controller");
      const serviceId = req.params.serviceId;

      if (!serviceId) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: "Service ID is required",
        });
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

      if (name !== undefined) {
        updateData.name = name;
      }

      if (description !== undefined) {
        updateData.description = description;
      }

      if (categoryId !== undefined) {
        updateData.categoryId = categoryId;
      }

      if (price !== undefined) {
        updateData.price = price;
      }

      if (req.file) {
        updateData.image = req.file.path;
      }

      if (Object.keys(updateData).length === 0) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: "No update data provided",
        });
        return;
      }

      const result = await this.serviceService.updateService(
        serviceId,
        updateData
      );

      res.status(result.status || HTTP_STATUS.OK).json({
        success: result.success,
        message: result.message,
        data: result.data,
      });
    } catch (error) {
      console.error("Error occurred while editing service:", error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: "An error occurred while editing service",
      });
    }
  }

  async addCategory(req: Request, res: Response): Promise<void> {
    try {
      console.log("entering to the admin adding the category");
      const name = req.body.name;

      if (!req.file) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: "Image file is required",
        });
        return;
      }

      const result = await this.serviceService.addCategory(name, req.file.path);

      res.status(result.status).json({
        success: result.success,
        message: result.message,
        data: result.data,
      });
    } catch (error) {
      console.log("error occured while adding the category:", error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: "An error occured while adding the category",
      });
    }
  }

  async getAllCategory(req: Request, res: Response): Promise<void> {
    try {
      console.log("entering to the function fetching all the categories");

      const page = parseInt(req.query.page as string) || undefined;
      const limit = parseInt(req.query.limit as string) || undefined;
      const search = (req.query.search as string) || undefined;
      const status = (req.query.status as string) || undefined;

      const result = await this.serviceService.getAllCategories({
        page,
        limit,
        search,
        status,
      });

      res.status(result.status).json(result);
    } catch (error) {
      console.error("Error in getAllPaginatedApplicants controller:", error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        message: "Error fetching applicants data",
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      });
    }
  }

  async toggleCategoryStatus(req: Request, res: Response): Promise<void> {
    try {
      console.log("entering to the toggle catagory status");
      const categoryId = req.params.categoryId;

      const result = await this.serviceService.toggleCategoryStatus(categoryId);

      res.status(result.status).json({
        success: result.success,
        message: result.message,
        data: result.data,
      });
    } catch (error) {
      console.error("Error occurred while toggling category status:", error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: "An error occurred while toggling category status",
      });
    }
  }

  async editCategory(req: Request, res: Response): Promise<void> {
    try {
      console.log("editing the category from the controller");
      const categoryId = req.params.categoryId;

      if (!categoryId) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: "Category ID is required",
        });
        return;
      }

      const { name } = req.body;

      const updateData: { name?: string; image?: string } = {};

      if (name !== undefined) {
        updateData.name = name;
      }

      if (req.file) {
        updateData.image = req.file.path;
      }

      if (Object.keys(updateData).length === 0) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: "No update data provided",
        });
        return;
      }

      const result = await this.serviceService.updateCategory(
        categoryId,
        updateData
      );

      res.status(result.status || HTTP_STATUS.OK).json({
        success: result.success,
        message: result.message,
        data: result.data,
      });
    } catch (error) {
      console.error("Error occurred while editing category:", error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: "An error occurred while editing category",
      });
    }
  }
}
