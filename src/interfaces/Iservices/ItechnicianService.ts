import {
  ForgotPasswordRequest,
  ForgotPasswordResponse,
  loginData,
  loginResponse,
  RegisterResponse,
  RejectTechnicianServiceResponse,
  ResendOtpResponse,
  ResetPasswordData,
  ResetPasswordResponse,
  SignupTechnicianData,
  TechnicianProfileResponse,
  tempTechnicianResponse,
  ToggleTechnicianStatusResponse,
  verifyOtpData,
} from "../DTO/IServices/ItechnicianService";
import { Itechnician } from "../Models/Itechnician";

export interface ItechnicianService {
  technicianSignUp(data: SignupTechnicianData): Promise<tempTechnicianResponse>;
  verifyOtp(data: verifyOtpData): Promise<RegisterResponse>;
  resendOtp(data: string): Promise<ResendOtpResponse>;
  forgotPassword(data: ForgotPasswordRequest): Promise<ForgotPasswordResponse>;
  resetPassword(data: ResetPasswordData): Promise<ResetPasswordResponse>;
  login(data: loginData): Promise<loginResponse>;
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
    status: number;
    message: string;
    data?: {
      applicants: Itechnician[];
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
  ): Promise<{ success: boolean; status: number; message: string }>;
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
  }): Promise<{
    success: boolean;
    status: number;
    message: string;
    data?: {
      technicians: Itechnician[];
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
  toggleTechnicianStatus(id: string): Promise<ToggleTechnicianStatusResponse>;
}
