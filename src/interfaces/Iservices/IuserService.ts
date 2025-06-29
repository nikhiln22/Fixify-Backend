import {
  AddMoneyResponse,
  EditProfileResponse,
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
import { IWallet } from "../Models/Iwallet";
import { IWalletTransaction } from "../Models/IwalletTransaction";

export interface IuserService {
  userSignUp(data: SignupUserData): Promise<tempUserResponse>;
  verifyOtp(data: verifyOtpData): Promise<RegisterResponse>;
  resendOtp(data: string): Promise<ResendOtpResponse>;
  forgotPassword(data: ForgotPasswordRequest): Promise<ForgotPasswordResponse>;
  resetPassword(data: ResetPasswordData): Promise<ResetPasswordResponse>;
  login(data: loginData): Promise<loginResponse>;
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
  getUserProfile(technicianId: string): Promise<UserProfileResponse>;
  editProfile(userId: string, updateData: any): Promise<EditProfileResponse>;
  addMoney(userId: string, amount: number): Promise<AddMoneyResponse>;
  verifyWalletStripeSession(
    sessionId: string,
    userId: string
  ): Promise<{
    success: boolean;
    status: number;
    message: string;
    data?: {
      wallet: IWallet | null;
      transaction: IWalletTransaction | null;
    };
  }>;
  getWalletBalance(userId: string): Promise<{
    success: boolean;
    status: number;
    message: string;
    data?: { balance: number };
  }>;
  getAllWalletTransactions(options: {
    page?: number;
    limit?: number;
    userId: string;
  }): Promise<{
    success: boolean;
    status: number;
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
