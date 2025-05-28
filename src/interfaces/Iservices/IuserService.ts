import {
  ForgotPasswordRequest,
  ForgotPasswordResponse,
  loginData,
  loginResponse,
  RegisterResponse,
  ResendOtpResponse,
  ResetPasswordData,
  ResetPasswordResponse,
  SignupUserData,
  tempUserResponse,
  ToggleUserStatusResponse,
  UserProfileResponse,
  verifyOtpData,
} from "../DTO/IServices/IuserService";
import { Iuser } from "../../interfaces/Models/Iuser";

export interface IuserService {
  userSignUp(data: SignupUserData): Promise<tempUserResponse>;
  verifyOtp(data: verifyOtpData): Promise<RegisterResponse>;
  resendOtp(data: string): Promise<ResendOtpResponse>;
  forgotPassword(data: ForgotPasswordRequest): Promise<ForgotPasswordResponse>;
  resetPassword(data: ResetPasswordData): Promise<ResetPasswordResponse>;
  login(data: loginData): Promise<loginResponse>;
  checkUserStatus(
    userId: string
  ): Promise<{ success: boolean; message: string; status: number }>;
  getAllUsers(options: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
  }): Promise<{
    success: boolean;
    status: number;
    message: string;
    data?: {
      users: Iuser[];
      pagination: {
        total: number;
        page: number;
        pages: number;
        limit: number;
        hasNextPage: boolean;
        hasPrevPage: boolean;
      };
    };
  }>;
  toggleUserStatus(id: string): Promise<ToggleUserStatusResponse>;
  getUserProfile(
    technicianId: string
  ): Promise<UserProfileResponse>;
}
