import { IAuthController } from "../interfaces/Icontrollers/IauthController";
import { inject, injectable } from "tsyringe";
import { IAuthService } from "../interfaces/Iservices/IauthService";
import { Request, Response } from "express";
import { HTTP_STATUS } from "../utils/httpStatus";
import {
  createSuccessResponse,
  createErrorResponse,
} from "../utils/responseHelper";

@injectable()
export class AuthController implements IAuthController {
  constructor(@inject("IAuthService") private _authService: IAuthService) {}

  async refreshAccessToken(req: Request, res: Response): Promise<void> {
    try {
      console.log(
        "entering to the access token generating with the existing refresh token"
      );

      const { role } = req.body;
      console.log("role:", role);

      if (!role) {
        const errorResponse = createErrorResponse(
          "Role is required in the body",
          "Validation failed"
        );
        res.status(HTTP_STATUS.BAD_REQUEST).json(errorResponse);
        return;
      }

      // Use single refresh_token instead of role-specific tokens
      const refreshToken = req.cookies?.refresh_token;
      console.log("refresh token from the refresh controller", refreshToken);

      if (!refreshToken) {
        const errorResponse = createErrorResponse(
          "Refresh token not found in cookies",
          "Authentication failed"
        );
        res.status(HTTP_STATUS.NOT_FOUND).json(errorResponse);
        return;
      }

      const result = await this._authService.refreshAccessToken(
        refreshToken,
        role
      );

      if (result.success) {
        const successResponse = createSuccessResponse(
          { access_token: result.data },
          result.message
        );
        res.status(HTTP_STATUS.OK).json(successResponse);
      } else {
        const errorResponse = createErrorResponse(
          result.message,
          "Token refresh failed"
        );
        res.status(HTTP_STATUS.UNAUTHORIZED).json(errorResponse);
      }
    } catch (error) {
      console.error("Error in refreshAccessToken controller:", error);
      const errorResponse = createErrorResponse(
        "Internal server error",
        "Failed to refresh access token"
      );
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(errorResponse);
    }
  }
}
