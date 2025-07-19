import {
  AddMoneyResponse,
  EditProfileResponse,
  ForgotPasswordRequest,
  ForgotPasswordResponse,
  LoginData,
  LoginResponse,
  RegisterResponse,
  ResendOtpResponse,
  ResetPasswordData,
  ResetPasswordResponse,
  SignupUserData,
  TempUserResponse,
  ToggleUserStatusResponse,
  UserProfileResponse,
  VerifyOtpData,
} from "../DTO/IServices/IuserService";
import { IUser } from "../../interfaces/Models/Iuser";
import { IWallet } from "../Models/Iwallet";
import { IWalletTransaction } from "../Models/IwalletTransaction";

export interface IUserService {
  userSignUp(data: SignupUserData): Promise<TempUserResponse>;
  verifyOtp(data: VerifyOtpData): Promise<RegisterResponse>;
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
  toggleUserStatus(id: string): Promise<ToggleUserStatusResponse>;
  getUserProfile(technicianId: string): Promise<UserProfileResponse>;
  editProfile(userId: string, updateData: any): Promise<EditProfileResponse>;
  addMoney(userId: string, amount: number): Promise<AddMoneyResponse>;
  verifyWalletStripeSession(
    sessionId: string,
    userId: string
  ): Promise<{
    success: boolean;
    message: string;
    data?: {
      wallet: IWallet | null;
      transaction: IWalletTransaction | null;
    };
  }>;
  getWalletBalance(userId: string): Promise<{
    success: boolean;
    message: string;
    data?: { balance: number };
  }>;
  getAllWalletTransactions(options: {
    page?: number;
    limit?: number;
    userId: string;
  }): Promise<{
    success: boolean;
    message: string;
    data?: {
      transactions: IWalletTransaction[];
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
}
