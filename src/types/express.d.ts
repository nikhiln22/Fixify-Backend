import { Roles } from "../config/roles";
import "express";
import { Server as SocketIOServer } from "socket.io";

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        role: Roles;
      };
      io?: SocketIOServer;
    }
  }
}

export {};
