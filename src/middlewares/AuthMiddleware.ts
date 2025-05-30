import { Request, Response, NextFunction } from "express";
import { JWTService } from "../utils/jwt";
import { HTTP_STATUS } from "../utils/httpStatus";
import { Roles } from "../config/roles";
import { UserRepository } from "../repositories/userRepository";
import { TechnicianRepository } from "../repositories/technicianRepository";

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

  private async checkUserStatus(userId: string, role: Roles): Promise<boolean> {
    try {
      console.log(
        "entering to the user status checking method in the auth middleware"
      );
      
      switch (role) {
        case Roles.USER:
          console.log(`checking user status for ID: ${userId}`);
          const user = await this.userRepository.findById(userId);
          if (!user) {
            console.log("User not found");
            return false;
          }

          return user.status === true;

        case Roles.TECHNICIAN:
          console.log(`checking technician status for ID: ${userId}`);
          const technicianResult = await this.technicianRepository.getTechnicianById(userId);
          if (!technicianResult.success || !technicianResult.technicianData) {
            console.log("Technician not found");
            return false;
          }

          return technicianResult.technicianData.is_verified === true && 
                 technicianResult.technicianData.status === "Active";

        
        default:
          console.log("Invalid role provided");
          return false;
      }
    } catch (error) {
      console.log("Error occurred while checking the user status:", error);
      return false;
    }
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

      const isActive = await this.checkUserStatus(userId, role);

      if (!isActive) {
        res.clearCookie(`${role.toLowerCase()}_refresh_token`, {
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


        const isActive = await this.checkUserStatus(payload.Id, role);
        if (!isActive) {
          res.clearCookie(`${role.toLowerCase()}_refresh_token`, {
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
        res
          .status(HTTP_STATUS.UNAUTHORIZED)
          .json({ message: "Invalid or expired token" });
        return;
      }
    };
  }
}