import { IserviceManagementController } from "../../interfaces/Icontrollers/Iadmincontrollers/IserviceManagementController";
import { inject, injectable } from "tsyringe";
import { IserviceManagementService } from "../../interfaces/Iservices/IadminService/IserviceManagementService";
import { HTTP_STATUS } from "../../utils/httpStatus";
import { Request, Response } from "express";

@injectable()
export class ServiceManagementController
  implements IserviceManagementController
{
  constructor(
    @inject("IserviceManagementService")
    private serviceManagementService: IserviceManagementService
  ) {}

  async addService(req: Request, res: Response): Promise<void> {
    try {
      console.log("adding the service by admin by the controller");
      const data = req.body;
      data.imageFile = req.file?.path;
      let result = await this.serviceManagementService.addService(data);
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

      const result = await this.serviceManagementService.getAllServices({
        page,
        limit,
        search,
        categoryId,
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
}
