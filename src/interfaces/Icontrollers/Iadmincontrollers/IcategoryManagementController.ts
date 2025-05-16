import { Request, Response } from "express";

export interface IcategoryManagementController {
  addCategory(req: Request, res: Response): Promise<void>;
  getAllCategory(req: Request, res: Response): Promise<void>;
  toggleCategoryStatus(req: Request, res: Response): Promise<void>;
  editCategory(req: Request, res: Response): Promise<void>;
}
