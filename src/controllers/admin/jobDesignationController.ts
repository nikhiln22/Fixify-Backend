import { Request, Response } from "express";
import { injectable, inject } from "tsyringe";
import { IjobDesignationService } from "../../interfaces/Iservices/IadminService/IjobDesignationService";
import { AddDesignationResponseDTO } from "../../interfaces/DTO/IServices/Iadminservices.dto/jobDesignationService.dto";
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

      const result: AddDesignationResponseDTO =
        await this.jobDesignationService.addDesignation(designation);

        console.log("result in the adddesignation controller:",result);

      res.status(result.status).json({
        message: result.message,
        designation: result.designation || null,
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
      console.log("id from the block designation control:",id);

      const result: AddDesignationResponseDTO =
        await this.jobDesignationService.toggleDesignationStatus(id);

      res.status(result.status).json({
        message: result.message,
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
      const page = (req.query.page as string) || 1;
      console.log("Pages from the jobDesignation Controller:", page);

      const result: AddDesignationResponseDTO =
        await this.jobDesignationService.getAllDesignations();

      console.log("Result in the getAllDesignations function:", result);

      res.status(result.status).json({
        message: result.message,
        designations: result.designation || [],
      });
    } catch (error) {
      console.error("Error fetching all designations:", error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        message: "Error fetching all designations.",
      });
    }
  }

  async getPaginatedDesignations(req: Request, res: Response): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const result: AddDesignationResponseDTO =
        await this.jobDesignationService.getPaginatedDesignations(page);

      res.status(result.status).json({
        message: result.message,
        designations: result.designation || [],
        total: result.total || 0,
        totalPages: result.totalPages || 0,
      });
    } catch (error) {
      console.error("Error fetching paginated designations:", error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        message: "Error fetching paginated designations.",
      });
    }
  }

  async findDesignationByName(req: Request, res: Response): Promise<void> {
    try {
      const { name } = req.params;

      const result: AddDesignationResponseDTO =
        await this.jobDesignationService.findDesignationByName(name);

      res.status(result.status).json({
        message: result.message,
        designation: result.designation || null,
      });
    } catch (error) {
      console.error("Error finding designation by name:", error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        message: "Error finding designation by name.",
      });
    }
  }
}
