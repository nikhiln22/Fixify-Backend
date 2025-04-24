import {
  ForgotPasswordRequestDTO,
  ForgotPasswordResponseDTO,
  loginDataDTO,
  loginResponseDTO,
  RegisterResponseDTO,
  ResendOtpResponseDTO,
  ResetPasswordDataDTO,
  ResetPasswordResponseDTO,
  SignupTechnicianDataDTO,
  tempTechnicianResponseDTO,
  verifyOtpDataDTO,
} from "../../DTO/IServices/technicianAuthService.dto";

export interface ItechnicianAuthService {
  technicianSignUp(data: SignupTechnicianDataDTO): Promise<tempTechnicianResponseDTO>;
  verifyOtp(data: verifyOtpDataDTO): Promise<RegisterResponseDTO>;
  resendOtp(data: string): Promise<ResendOtpResponseDTO>;
  forgotPassword(data: ForgotPasswordRequestDTO): Promise<ForgotPasswordResponseDTO>
  resetPassword(data: ResetPasswordDataDTO): Promise<ResetPasswordResponseDTO>;
  login(data: loginDataDTO): Promise<loginResponseDTO>;
}
