import { Request, Response } from "express";

export interface IadminAuthController {
  login(req: Request, res: Response): Promise<void>;
  logout(req: Request, res: Response): Promise<void>;
}
