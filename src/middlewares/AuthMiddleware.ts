import { Request, Response, NextFunction } from "express";
import { JWTService } from "../utils/jwt";
import { HTTP_STATUS } from "../utils/httpStatus";
import { Roles } from "../config/roles";

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    role: Roles;
  };
}

interface JwtPayload {
  Id: string;
  role: Roles;
}

export class AuthMiddleware {
  private static instance: AuthMiddleware;
  private jwtService: JWTService;

  private constructor() {
    this.jwtService = new JWTService();
  }

  public static getInstance(): AuthMiddleware {
    if (!AuthMiddleware.instance) {
      AuthMiddleware.instance = new AuthMiddleware();
    }
    return AuthMiddleware.instance;
  }

  private getToken(req: Request): string | null {
    const header = req.headers.authorization;
    console.log("header from the getToken method in Auth Middleware:", header);
    if (!header || !header.startsWith("Bearer ")) return null;
    return header.split(" ")[1];
  }

  authenticate(role: Roles) {
    return (req: Request, res: Response, next: NextFunction) => {
      const token = this.getToken(req);
      console.log(
        "token from the authenticate method in Auth Middleware:",
        token
      );
      if (!token) {
        res
          .status(HTTP_STATUS.UNAUTHORIZED)
          .json({ message: "No token provided" });
        return;
      }

      try {
        const payload = this.jwtService.verifyAccessToken(token) as JwtPayload;
        console.log(
          "payload from the authenticate method in the Auth Middleware:",
          payload
        );
        if (!payload || payload.role !== role) {
          res
            .status(HTTP_STATUS.UNAUTHORIZED)
            .json({ message: "Access denied: invalid role" });
          return;
        }

        (req as AuthenticatedRequest).user = {
          id: payload.Id,
          role: payload.role,
        };

        next();
      } catch (error) {
        res
          .status(HTTP_STATUS.UNAUTHORIZED)
          .json({ message: "Invalid or expired token" });
        return;
      }
    };
  }
}
