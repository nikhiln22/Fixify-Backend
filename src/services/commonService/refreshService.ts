import { IjwtService } from "../../interfaces/Ijwt/Ijwt";
import { IrefreshService } from "../../interfaces/Iservices/IcommonService/IrefreshService";
import { inject, injectable } from "tsyringe";

@injectable()
export class RefreshService implements IrefreshService {
  constructor(@inject("IjwtService") private jwtService: IjwtService) {}

  async refreshAccessToken(
    refreshToken: string,
    role: string
  ): Promise<string> {
    try {
      console.log(
        "refresh token from the refresh access token service:",
        refreshToken
      );

      const payload = this.jwtService.verifyRefreshToken(refreshToken);

      console.log("payload from the refresh service:", payload);

      if (!payload) {
        throw new Error("Invalid or expired refresh token");
      }

      const tokenRole = payload.role?.toLowerCase();

      console.log("tokenRole:", tokenRole);

      const expectedRole = role.toLowerCase();

      console.log("expectedRole:", expectedRole);

      if (tokenRole !== expectedRole) {
        throw new Error("Token role mismatch");
      }

      const newAccessToken = this.jwtService.generateAccessToken(
        payload._id,
        payload.role
      );

      console.log("newAcessToken:", newAccessToken);

      return newAccessToken;
    } catch (error: any) {
      console.error(
        "Error in RefreshService.refreshAccessToken:",
        error.message
      );
      throw new Error("Unable to refresh access token");
    }
  }
}
