import {
  ForgotPasswordRequest,
  ForgotPasswordResponse,
  loginData,
  loginResponse,
  RegisterResponse,
  ResendOtpResponse,
  ResetPasswordData,
  ResetPasswordResponse,
  SignupTechnicianData,
  TechnicianProfileResponse,
  tempTechnicianResponse,
  verifyOtpData,
} from "../DTO/IServices/ItechnicianService";

export interface ItechnicianService {
  technicianSignUp(data: SignupTechnicianData): Promise<tempTechnicianResponse>;
  verifyOtp(data: verifyOtpData): Promise<RegisterResponse>;
  resendOtp(data: string): Promise<ResendOtpResponse>;
  forgotPassword(data: ForgotPasswordRequest): Promise<ForgotPasswordResponse>;
  resetPassword(data: ResetPasswordData): Promise<ResetPasswordResponse>;
  login(data: loginData): Promise<loginResponse>;
  submitTechnicianQualifications(
    technicianId: String,
    qualificationData: {
      experience: string;
      designation: string;
      about: string;
      city: string;
      preferredWorkLocation: string;
      profilePhoto?: Express.Multer.File;
      certificates?: Express.Multer.File[];
    }
  ): Promise<any>;
  getTechnicianProfile(
    technicianId: string
  ): Promise<TechnicianProfileResponse>;
}
