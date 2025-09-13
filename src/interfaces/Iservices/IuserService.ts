import {
  EditProfileResponse,
  ForgotPasswordRequest,
  ForgotPasswordResponse,
  LoginData,
  LoginResponse,
  ResendOtpResponse,
  ResetPasswordData,
  ResetPasswordResponse,
  SignupUserData,
  SignUpUserResponse,
  ToggleUserStatusResponse,
  UserProfileResponse,
  UserProfileUpdateData,
  VerifyOtpData,
  VerifyOtpResponse,
} from "../DTO/IServices/IuserService";
import { IUser } from "../../interfaces/Models/Iuser";

export interface IUserService {
  userSignUp(data: SignupUserData): Promise<SignUpUserResponse>;
  verifyOtp(data: VerifyOtpData): Promise<VerifyOtpResponse>;
  resendOtp(data: string): Promise<ResendOtpResponse>;
  forgotPassword(data: ForgotPasswordRequest): Promise<ForgotPasswordResponse>;
  resetPassword(data: ResetPasswordData): Promise<ResetPasswordResponse>;
  login(data: LoginData): Promise<LoginResponse>;
  getAllUsers(options: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
  }): Promise<{
    success: boolean;
    message: string;
    data?: {
      users: IUser[];
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
  toggleUserStatus(userId: string): Promise<ToggleUserStatusResponse>;
  getUserProfile(technicianId: string): Promise<UserProfileResponse>;
  editProfile(
    userId: string,
    updateData: UserProfileUpdateData
  ): Promise<EditProfileResponse>;
  countActiveUsers(): Promise<number>;
}
