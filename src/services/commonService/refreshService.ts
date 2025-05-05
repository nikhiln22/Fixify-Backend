import { IjwtService } from "../../interfaces/Ijwt/Ijwt";
import { IrefreshService } from "../../interfaces/Iservices/IcommonService/IrefreshService";
import { inject, injectable } from "tsyringe";

@injectable()
export class RefreshService implements IrefreshService {
  constructor(@inject("IjwtService") private jwtService: IjwtService) {}

  async refreshAccessToken(refreshToken: string, role: string): Promise<string> {
    try {
      const payload = this.jwtService.verifyRefreshToken(refreshToken);

      if (!payload) {
        throw new Error("Invalid or expired refresh token");
      }

      const tokenRole = payload.role?.toLowerCase();
      const expectedRole = role.toLowerCase();

      if (tokenRole !== expectedRole) {
        throw new Error("Token role mismatch");
      }

      const newAccessToken = this.jwtService.generateAccessToken(
        payload._id,
        payload.role
      );

      return newAccessToken;
    } catch (error: any) {
      console.error("Error in RefreshService.refreshAccessToken:", error.message);
      throw new Error("Unable to refresh access token");
    }
  }
}
