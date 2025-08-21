import { Request, Response } from "express";

export interface IAuthController {
  newAccessToken(req: Request, res: Response): Promise<void>;
}
