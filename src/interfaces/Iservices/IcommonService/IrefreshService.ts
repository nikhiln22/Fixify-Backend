export interface IrefreshService {
  refreshAccessToken(refreshToken: string, role: string): Promise<string>;
}
