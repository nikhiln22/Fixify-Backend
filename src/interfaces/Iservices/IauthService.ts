export interface IauthService {
  refreshAccessToken(refreshToken: string, role: string): Promise<string>;
}