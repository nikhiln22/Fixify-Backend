
export interface IAuthService {
  newAccessToken(refreshToken: string): Promise<{
    success: boolean;
    data?: string;
    message: string;
  }>;
}
