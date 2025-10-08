import { Request, Response, NextFunction } from "express";
import { JWTService } from "../utils/jwt";
import { HTTP_STATUS } from "../utils/httpStatus";
import { Roles } from "../config/roles";
import { UserRepository } from "../repositories/userRepository";
import { TechnicianRepository } from "../repositories/technicianRepository";
import { Server as SocketIOServer } from "socket.io";
import { AdminRepository } from "../repositories/adminRepository";

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
  private adminRepository: AdminRepository;

  private constructor() {
    this.jwtService = new JWTService();
    this.userRepository = new UserRepository();
    this.technicianRepository = new TechnicianRepository();
    this.adminRepository = new AdminRepository();
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

  private async validateTokenAndRole(
    req: Request,
    res: Response,
    roles: Roles[]
  ): Promise<JwtPayload | null> {
    const token = this.getToken(req);
    if (!token) {
      res
        .status(HTTP_STATUS.UNAUTHORIZED)
        .json({ message: "No token provided" });
      return null;
    }

    try {
      const payload = this.jwtService.verifyAccessToken(token) as JwtPayload;
      if (!payload || !roles.includes(payload.role)) {
        res
          .status(HTTP_STATUS.FORBIDDEN)
          .json({ message: "Access denied: invalid role" });
        return null;
      }

      (req as AuthenticatedRequest).user = {
        id: payload.Id,
        role: payload.role,
      };

      return payload;
    } catch (error) {
      console.log("error occurred while validating token:", error);
      res
        .status(HTTP_STATUS.UNAUTHORIZED)
        .json({ message: "Invalid or expired token" });
      return null;
    }
  }

  private handleAccountBlocked(res: Response) {
    res.clearCookie(`refresh_token`, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
    });

    res.status(HTTP_STATUS.FORBIDDEN).json({
      message: "Account verification required or account suspended.",
      accountBlocked: true,
    });
  }

  private async checkAccountStatus(
    userId: string,
    role: Roles
  ): Promise<boolean> {
    try {
      if (role === Roles.USER) {
        const user = await this.userRepository.findById(userId);
        if (!user) return false;
        return user.status === "Active";
      } else if (role === Roles.TECHNICIAN) {
        const technicianResult =
          await this.technicianRepository.getTechnicianById(userId);
        if (!technicianResult) return false;
        return (
          technicianResult.is_verified === true &&
          technicianResult.status === "Active"
        );
      } else if (role === Roles.ADMIN) {
        const adminResult = await this.adminRepository.findById(userId);
        if (!adminResult) return false;
        return adminResult.status === "Active";
      } else {
        return false;
      }
    } catch (error) {
      console.log("Error occurred while checking account status:", error);
      return false;
    }
  }

  private async checkBasicAccess(
    userId: string,
    role: Roles
  ): Promise<boolean> {
    try {
      if (role === Roles.USER) {
        const user = await this.userRepository.findById(userId);
        if (!user) return false;
        return user.status !== "Blocked";
      } else if (role === Roles.TECHNICIAN) {
        const technicianResult =
          await this.technicianRepository.getTechnicianById(userId);
        if (!technicianResult) return false;
        return technicianResult.status !== "Blocked";
      } else if (role === Roles.ADMIN) {
        const adminResult = await this.adminRepository.findById(userId);
        if (!adminResult) return false;
        return adminResult.status !== "Blocked";
      } else {
        return false;
      }
    } catch (error) {
      console.log("Error occurred while checking basic access:", error);
      return false;
    }
  }

  // Full authentication - requires complete verification (for main features)
  authenticate(...roles: Roles[]) {
    return async (req: Request, res: Response, next: NextFunction) => {
      const payload = await this.validateTokenAndRole(req, res, roles);
      if (!payload) return;

      const isFullyVerified = await this.checkAccountStatus(
        payload.Id,
        payload.role
      );

      if (!isFullyVerified) {
        this.handleAccountBlocked(res);
        return;
      }

      next();
    };
  }

  // Basic authentication - for profile access (not blocked)
  authenticateBasic(...roles: Roles[]) {
    return async (req: Request, res: Response, next: NextFunction) => {
      const payload = await this.validateTokenAndRole(req, res, roles);
      if (!payload) return;

      const hasBasicAccess = await this.checkBasicAccess(
        payload.Id,
        payload.role
      );

      if (!hasBasicAccess) {
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
    };
  }
}
