import {
  ForgotPasswordRequest,
  ForgotPasswordResponse,
  LoginData,
  LoginResponse,
  RegisterResponse,
  RejectTechnicianServiceResponse,
  ResendOtpResponse,
  ResetPasswordData,
  ResetPasswordResponse,
  SignupTechnicianData,
  TechnicianProfileResponse,
  TempTechnicianResponse,
  ToggleTechnicianStatusResponse,
  VerifyOtpData,
} from "../DTO/IServices/ItechnicianService";
import { IRating } from "../Models/Irating";
import { ITechnician } from "../Models/Itechnician";
import { IWalletTransaction } from "../Models/IwalletTransaction";

export interface ITechnicianService {
  technicianSignUp(data: SignupTechnicianData): Promise<TempTechnicianResponse>;
  verifyOtp(data: VerifyOtpData): Promise<RegisterResponse>;
  resendOtp(data: string): Promise<ResendOtpResponse>;
  forgotPassword(data: ForgotPasswordRequest): Promise<ForgotPasswordResponse>;
  resetPassword(data: ResetPasswordData): Promise<ResetPasswordResponse>;
  login(data: LoginData): Promise<LoginResponse>;
  submitTechnicianQualifications(
    technicianId: string,
    qualificationData: {
      experience: string;
      designation: string;
      about: string;
      address: string;
      latitude: number | undefined;
      longitude: number | undefined;
      profilePhoto?: Express.Multer.File;
      certificates?: Express.Multer.File[];
    }
  ): Promise<any>;
  getAllApplicants(options: { page?: number; limit?: number }): Promise<{
    success: boolean;
    message: string;
    data?: {
      applicants: ITechnician[];
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
  verifyTechnician(
    technicianId: string
  ): Promise<{ success: boolean; message: string }>;
  rejectTechnician(
    technicianId: string,
    reason?: string
  ): Promise<RejectTechnicianServiceResponse>;
  getTechnicianProfile(
    technicianId: string
  ): Promise<TechnicianProfileResponse>;
  getAllTechnicians(options: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    designation?: string;
    designationId?: string;
    longitude?: string;
    latitude?: string;
    radius?: number;
  }): Promise<{
    success: boolean;
    message: string;
    data?: {
      technicians: ITechnician[];
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
  getNearbyTechnicians(
    designationId: string,
    longitude: number,
    latitude: number,
    radius: number
  ): Promise<{
    success: boolean;
    message: string;
    data?: ITechnician[];
  }>;

  toggleTechnicianStatus(id: string): Promise<ToggleTechnicianStatusResponse>;

  getWalletBalance(technicianId: string): Promise<{
    success: boolean;
    message: string;
    data?: { balance: number };
  }>;

  getAllWalletTransactions(options: {
    page?: number;
    limit?: number;
    technicianId: string;
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

  getReviews(techncianId: string): Promise<{
    success: boolean;
    message: string;
    reviews?: IRating[];
    averageRating?: number;
    totalReviews?: number;
  }>;

  getTechniciansWithSubscriptions(options: {
    page?: number;
    limit?: number;
    search?: string;
    filterPlan?: string;
  }): Promise<{
    success: boolean;
    message: string;
    data?: {
      technicians: ITechnician[];
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
