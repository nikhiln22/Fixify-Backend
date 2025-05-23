import { Request, Response } from "express";

export interface IjobController {
  addDesignation(req: Request, res: Response): Promise<void>;
  toggleDesignationStatus(req: Request, res: Response): Promise<void>;
  getAllDesignations(req: Request, res: Response): Promise<void>;
  findDesignationByName(req: Request, res: Response): Promise<void>;
}
