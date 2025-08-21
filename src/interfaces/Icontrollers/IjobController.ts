import { Request, Response } from "express";

export interface IJobController {
  addDesignation(req: Request, res: Response): Promise<void>;
  toggleDesignationStatus(req: Request, res: Response): Promise<void>;
  getAllDesignations(req: Request, res: Response): Promise<void>;
}
