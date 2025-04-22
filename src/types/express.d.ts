import { Roles } from "../config/roles";
import "express";

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        role: Roles;
      };
    }
  }
}

export {};
