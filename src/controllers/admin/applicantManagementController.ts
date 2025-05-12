import { Request, Response } from "express";
import { inject, injectable } from "tsyringe";
import { HTTP_STATUS } from "../../utils/httpStatus";
import { IapplicantManagementController } from "../../interfaces/Icontrollers/Iadmincontrollers/IapplicantManagementController";
import { IapplicantManagementService } from "../../interfaces/Iservices/IadminService/IapplicantManagementService";

@injectable()
export class ApplicantManagementController implements IapplicantManagementController {
  constructor(
    @inject("IapplicantManagementService")
    private applicantManagementService: IapplicantManagementService
  ) {}

  async getAllPaginatedApplicants(req: Request, res: Response): Promise<void> {
    try {
      console.log("entering to the applicants listing");
      
      const page = parseInt(req.query.page as string) || 1;
      
      const response = await this.applicantManagementService.getPaginatedUnverifiedTechnicians(page);
      
      res.status(response.status).json({
        message: response.message,
        applicants: response.applicants || [],
        total: response.total || 0,
        totalPages: response.totalPages || 0
      });
    } catch (error) {
      console.error("Error in getAllPaginatedApplicants controller:", error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        message: "Error fetching applicants data",
        error: error instanceof Error ? error.message : "Unknown error occurred"
      });
    }
  }
}