import { Request, Response } from "express";

export interface IuserManagemenrController {
  getAllPaginatedUsers(req: Request, res: Response): Promise<void>;
  toggleUserStatus(req: Request, res: Response): Promise<void>;
}
