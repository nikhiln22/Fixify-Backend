export interface IjwtService {
  generateAccessToken(userId: string, role: string): string;
  generateRefreshToken(userId: string, role: string): string;
  verifyAccessToken(token: string): any;
  verifyRefreshToken(token: string): any;
  decodeToken(token: string): any;
}
