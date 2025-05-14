import { Request, Response } from "express";

export interface IapplicantManagementController {
  getAllPaginatedApplicants(req: Request, res: Response): Promise<void>;
  // updateApplicantStatus(req: Request, res: Response): Promise<void>;
}
