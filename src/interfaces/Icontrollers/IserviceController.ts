import { Request, Response } from "express";

export interface IserviceController {
  addCategory(req: Request, res: Response): Promise<void>;
  getAllCategory(req: Request, res: Response): Promise<void>;
  toggleCategoryStatus(req: Request, res: Response): Promise<void>;
  editCategory(req: Request, res: Response): Promise<void>;
  addService(req: Request, res: Response): Promise<void>;
  getAllServices(req: Request, res: Response): Promise<void>;
  toggleServiceStatus(req: Request, res: Response): Promise<void>;
  editService(req: Request, res: Response): Promise<void>;
}
