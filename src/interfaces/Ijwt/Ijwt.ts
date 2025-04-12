export interface IjwtService {
  generateAccessToken(Id: string, role: string): string;
  generateRefreshToken(Id: string, role: string): string;
  verifyAccessToken(token: string): any;
  verifyRefreshToken(token: string): any;
  decodeToken(token: string): any;
}
