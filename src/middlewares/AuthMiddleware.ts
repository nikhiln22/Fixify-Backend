import { Request, Response, NextFunction } from "express";
import { JWTService } from "../utils/jwt";
import { HTTP_STATUS } from "../utils/httpStatus";
import { Roles } from "../config/roles";
import { UserRepository } from "../repositories/userRepository";
import { TechnicianRepository } from "../repositories/technicianRepository";
import { Server as SocketIOServer } from "socket.io";

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    role: Roles;
  };
  io?: SocketIOServer;
}

interface JwtPayload {
  Id: string;
  role: Roles;
}

export class AuthMiddleware {
  private static instance: AuthMiddleware;
  private jwtService: JWTService;
  private userRepository: UserRepository;
  private technicianRepository: TechnicianRepository;

  private constructor() {
    this.jwtService = new JWTService();
    this.userRepository = new UserRepository();
    this.technicianRepository = new TechnicianRepository();
  }

  public static getInstance(): AuthMiddleware {
    if (!AuthMiddleware.instance) {
      AuthMiddleware.instance = new AuthMiddleware();
    }
    return AuthMiddleware.instance;
  }

  private getToken(req: Request): string | null {
    const header = req.headers.authorization;
    if (!header || !header.startsWith("Bearer ")) return null;
    return header.split(" ")[1];
  }

  authenticate(role: Roles) {
    return (req: Request, res: Response, next: NextFunction) => {
      const token = this.getToken(req);
      if (!token) {
        res
          .status(HTTP_STATUS.UNAUTHORIZED)
          .json({ message: "No token provided" });
        return;
      }

      try {
        const payload = this.jwtService.verifyAccessToken(token) as JwtPayload;
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
        console.log("error occured while authenticating user:", error);
        res
          .status(HTTP_STATUS.UNAUTHORIZED)
          .json({ message: "Invalid or expired token" });
        return;
      }
    };
  }

  private async checkAccountBlocked(
    userId: string,
    role: Roles
  ): Promise<boolean> {
    try {
      if (role === Roles.USER) {
        console.log(`checking user account blocked status for ID: ${userId}`);
        const user = await this.userRepository.findById(userId);
        if (!user) {
          console.log("User not found");
          return false;
        }
        // For users: only allow if status is Active
        return user.status === "Active";
      } else if (role === Roles.TECHNICIAN) {
        console.log(
          `checking technician account blocked status for ID: ${userId}`
        );
        const technicianResult =
          await this.technicianRepository.getTechnicianById(userId);
        if (!technicianResult) {
          console.log("Technician not found");
          return false;
        }
        return technicianResult.status !== "Blocked";
      } else {
        console.log("Invalid role provided");
        return false;
      }
    } catch (error) {
      console.log(
        "Error occurred while checking account blocked status:",
        error
      );
      return false;
    }
  }

  private async checkFullVerification(
    userId: string,
    role: Roles
  ): Promise<boolean> {
    try {
      if (role === Roles.USER) {
        console.log(`checking user full verification for ID: ${userId}`);
        const user = await this.userRepository.findById(userId);
        if (!user) {
          console.log("User not found");
          return false;
        }
        return user.status === "Active";
      } else if (role === Roles.TECHNICIAN) {
        console.log(`checking technician full verification for ID: ${userId}`);
        const technicianResult =
          await this.technicianRepository.getTechnicianById(userId);
        if (!technicianResult) {
          console.log("Technician not found");
          return false;
        }
        return (
          technicianResult.is_verified === true &&
          technicianResult.status === "Active"
        );
      } else {
        console.log("Invalid role provided");
        return false;
      }
    } catch (error) {
      console.log("Error occurred while checking full verification:", error);
      return false;
    }
  }

  authenticateAndCheckBlocked(role: Roles) {
    return async (req: Request, res: Response, next: NextFunction) => {
      const token = this.getToken(req);
      if (!token) {
        res
          .status(HTTP_STATUS.UNAUTHORIZED)
          .json({ message: "No token provided" });
        return;
      }

      try {
        const payload = this.jwtService.verifyAccessToken(token) as JwtPayload;
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

        const isNotBlocked = await this.checkAccountBlocked(payload.Id, role);
        if (!isNotBlocked) {
          res.clearCookie(`refresh_token`, {
            httpOnly: true,
            secure: true,
            sameSite: "strict",
          });

          res.status(HTTP_STATUS.FORBIDDEN).json({
            message: "Account has been suspended. Please contact support.",
            accountBlocked: true,
          });
          return;
        }

        next();
      } catch (error) {
        console.log("error occured while validating token:", error);
        res
          .status(HTTP_STATUS.UNAUTHORIZED)
          .json({ message: "Invalid or expired token" });
        return;
      }
    };
  }

  authenticateAndCheckStatus(role: Roles) {
    return async (req: Request, res: Response, next: NextFunction) => {
      const token = this.getToken(req);
      if (!token) {
        res
          .status(HTTP_STATUS.UNAUTHORIZED)
          .json({ message: "No token provided" });
        return;
      }

      try {
        const payload = this.jwtService.verifyAccessToken(token) as JwtPayload;
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

        const isFullyVerified = await this.checkFullVerification(
          payload.Id,
          role
        );
        if (!isFullyVerified) {
          res.clearCookie(`refresh_token`, {
            httpOnly: true,
            secure: true,
            sameSite: "strict",
          });

          res.status(HTTP_STATUS.FORBIDDEN).json({
            message: "Account verification required or account suspended.",
            accountBlocked: true,
          });
          return;
        }

        next();
      } catch (error) {
        console.log("error occured while validating token:", error);
        res
          .status(HTTP_STATUS.UNAUTHORIZED)
          .json({ message: "Invalid or expired token" });
        return;
      }
    };
  }

  checkStatus(role: Roles) {
    return async (req: Request, res: Response, next: NextFunction) => {
      const authenticatedReq = req as AuthenticatedRequest;
      const userId = authenticatedReq.user?.id;

      if (!userId) {
        res
          .status(HTTP_STATUS.BAD_REQUEST)
          .json({ message: "User ID is required - please authenticate first" });
        return;
      }

      const isFullyVerified = await this.checkFullVerification(userId, role);

      if (!isFullyVerified) {
        res.clearCookie(`refresh_token`, {
          httpOnly: true,
          secure: true,
          sameSite: "strict",
        });

        res.status(HTTP_STATUS.FORBIDDEN).json({
          message: "Account verification required or account suspended.",
          accountBlocked: true,
        });
        return;
      }

      next();
    };
  }
}
