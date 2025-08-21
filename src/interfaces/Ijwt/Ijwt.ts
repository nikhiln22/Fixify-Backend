export interface ITokenPayload {
  Id: string;
  role: string;
  iat: number;
  exp: number;
}

export interface IJwtService {
  generateAccessToken(Id: string, role: string): string;
  generateRefreshToken(Id: string, role: string): string;
  verifyAccessToken(token: string): ITokenPayload | null;
  verifyRefreshToken(token: string): ITokenPayload | null;
}
