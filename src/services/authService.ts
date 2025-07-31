import { IJwtService } from "../interfaces/Ijwt/Ijwt";
import { IAuthService } from "../interfaces/Iservices/IauthService";
import { inject, injectable } from "tsyringe";

@injectable()
export class AuthService implements IAuthService {
  constructor(@inject("IJwtService") private _jwtService: IJwtService) {}

  async refreshAccessToken(
    refreshToken: string,
    requestedRole: string
  ): Promise<{
    success: boolean;
    data?: string;
    message: string;
  }> {
    try {
      console.log(
        "refresh token from the refresh access token service:",
        refreshToken
      );

      const payload = this._jwtService.verifyRefreshToken(refreshToken);
      console.log("payload from the refresh service:", payload);

      if (!payload) {
        return {
          success: false,
          message: "Invalid or expired refresh token",
        };
      }

      const tokenRole = payload.role.toLowerCase();
      const expectedRole = requestedRole.toLowerCase();

      console.log("tokenRole from JWT:", tokenRole);
      console.log("requestedRole from frontend:", expectedRole);

      if (tokenRole !== expectedRole) {
        return {
          success: false,
          message: "Token role mismatch - unauthorized role access",
        };
      }

      console.log("payload from authservice:", payload);

      const newAccessToken = this._jwtService.generateAccessToken(
        payload.Id,
        payload.role
      );

      console.log("newAccessToken generated successfully");

      return {
        success: true,
        data: newAccessToken,
        message: "Access token refreshed successfully",
      };
    } catch (error: any) {
      console.error("Error in AuthService.refreshAccessToken:", error.message);
      return {
        success: false,
        message: "Unable to refresh access token",
      };
    }
  }
}
