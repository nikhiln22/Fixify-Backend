import { Request, Response } from "express";

export interface IAuthController {
  refreshAccessToken(req: Request, res: Response): Promise<void>;
}