import { Request, Response } from "express";

export interface ItechnicianController {
  getJobDesignations(req: Request, res: Response): Promise<void>;
  submitQualifications(req: Request, res: Response): Promise<void>;
  getProfile(req: Request, res: Response): Promise<void>;
  getCityLocation(req: Request, res: Response): Promise<void>;
  getLocationByCity(req: Request, res: Response): Promise<void>;
}
