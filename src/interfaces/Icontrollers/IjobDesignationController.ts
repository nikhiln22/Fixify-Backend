import { Request, Response } from "express";

export interface IjobDesignationController {
  addDesignation(req: Request, res: Response): Promise<void>;
  blockDesignation(req: Request, res: Response): Promise<void>;
  getAllDesignations(req: Request, res: Response): Promise<void>;
  findDesignationByName(req: Request, res: Response): Promise<void>;
}
