import { Request, Response } from "express";

export interface ItechnicianController {
  getJobDesignations(req: Request, res: Response): Promise<void>;
  submitQualifications(req: Request, res: Response): Promise<void>;
  getProfile(req: Request, res: Response): Promise<void>;
}
