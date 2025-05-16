import { Request, Response } from "express";

export interface IserviceManagementController {
  addService(req: Request, res: Response): Promise<void>;
  getAllServices(req: Request, res: Response): Promise<void>;
}
