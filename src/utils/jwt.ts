import jwt, { Secret, SignOptions } from "jsonwebtoken";
import { IjwtService } from "../interfaces/Ijwt/Ijwt";
import config from "../config/env";

export class JWTService implements IjwtService {
  generateAccessToken(userId: string, role: string): string {
    try {
      console.log("time:", config.JWT_EXPIRATION);
      const options: SignOptions = {
        expiresIn: config.JWT_EXPIRATION as unknown as number,
      };
      return jwt.sign({ userId, role }, config.JWT_SECRET as Secret, options);
    } catch (error) {
      console.log("error:", error);
      throw new Error("Error generating access token");
    }
  }

  generateRefreshToken(userId: string, role: string): string {
    try {
      console.log("RefreshToken time:", config.JWT_REFRESH_EXPIRATION);
      const options: SignOptions = {
        expiresIn: config.JWT_REFRESH_EXPIRATION as unknown as number,
      };
      return jwt.sign(
        { userId, role },
        config.JWT_REFRESH_SECRET as Secret,
        options
      );
    } catch (error) {
      console.log("error:", error);
      throw new Error("Error generating refresh token");
    }
  }

  verifyAccessToken(token: string): any {
    try {
      return jwt.verify(token, config.JWT_SECRET);
    } catch (error) {
      console.log("error:", error);
      throw new Error("Invalid or expired access token");
    }
  }

  verifyRefreshToken(token: string): any {
    try {
      return jwt.verify(token, config.JWT_REFRESH_SECRET);
    } catch (error) {
      console.log("error:", error);
      throw new Error("Invalid or expired refresh token");
    }
  }

  decodeToken(token: string): any {
    return jwt.decode(token);
  }
}
