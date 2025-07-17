export interface IAuthService {
  refreshAccessToken(refreshToken: string, role: string): Promise<string>;
}