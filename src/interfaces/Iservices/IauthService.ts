export interface IAuthService {
  refreshAccessToken(
    refreshToken: string,
    role: string
  ): Promise<{
    success: boolean;
    data?: string;
    message: string;
  }>;
}
