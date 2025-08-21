import { IJwtService } from "../interfaces/Ijwt/Ijwt";
import { IAuthService } from "../interfaces/Iservices/IauthService";
import { inject, injectable } from "tsyringe";

@injectable()
export class AuthService implements IAuthService {
  constructor(@inject("IJwtService") private _jwtService: IJwtService) {}

  async newAccessToken(refreshToken: string): Promise<{
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
    } catch (error) {
      console.error("Error in AuthService.refreshAccessToken:", error);
      return {
        success: false,
        message: "Unable to refresh access token",
      };
    }
  }
}
