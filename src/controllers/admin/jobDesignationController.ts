import { Request, Response } from "express";
import { injectable, inject } from "tsyringe";
import { IjobDesignationService } from "../../interfaces/Iservices/IadminService/IjobDesignationService";
import { IjobDesignationController } from "../../interfaces/Icontrollers/Iadmincontrollers/IjobDesignationController";
import { HTTP_STATUS } from "../../utils/httpStatus";

@injectable()
export class JobDesignationController implements IjobDesignationController {
  constructor(
    @inject("IjobDesignationService")
    private jobDesignationService: IjobDesignationService
  ) {}

  async addDesignation(req: Request, res: Response): Promise<void> {
    try {
      const { designation } = req.body;

      const result = await this.jobDesignationService.addDesignation(
        designation
      );

      console.log("result in the adddesignation controller:", result);

      res.status(result.status).json({
        message: result.message,
        designation: result.data || null,
      });
    } catch (error) {
      console.error("Error adding designation:", error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        message: "Error adding designation.",
      });
    }
  }

  async toggleDesignationStatus(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      console.log("id from the block designation control:", id);

      const result = await this.jobDesignationService.toggleDesignationStatus(
        id
      );

      res.status(result.status).json({
        message: result.message,
        data: result.data,
      });
    } catch (error) {
      console.error("Error blocking designation:", error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        message: "Error blocking designation.",
      });
    }
  }

  async getAllDesignations(req: Request, res: Response): Promise<void> {
    try {
      console.log("function fetching all the job designations");
      const page = parseInt(req.query.page as string) || undefined;
      const limit = parseInt(req.query.limit as string) || undefined;
      const search = (req.query.search as string) || undefined;

      const result = await this.jobDesignationService.getAllDesignations({
        page,
        limit,
        search,
      });

      console.log(
        "result from the fetching all designations controller:",
        result
      );
      res.status(result.status).json(result);
    } catch (error) {
      console.error("Error in getAllDesignations controller:", error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: "Error fetching designations",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  async findDesignationByName(req: Request, res: Response): Promise<void> {
    try {
      const { name } = req.params;

      const result = await this.jobDesignationService.findDesignationByName(
        name
      );

      res.status(result.status).json({
        message: result.message,
        designation: result.data || null,
      });
    } catch (error) {
      console.error("Error finding designation by name:", error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        message: "Error finding designation by name.",
      });
    }
  }
}
