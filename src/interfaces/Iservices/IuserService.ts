import {
  ForgotPasswordRequestDTO,
  ForgotPasswordResponseDTO,
  loginDataDTO,
  loginResponseDTO,
  RegisterResponseDTO,
  ResendOtpResponseDTO,
  ResetPasswordDataDTO,
  ResetPasswordResponseDTO,
  SignupUserDataDTO,
  tempUserResponseDTO,
  verifyOtpDataDTO,
} from "../DTO/IServices/userService.dto";

export interface IuserService {
  userSignUp(data: SignupUserDataDTO): Promise<tempUserResponseDTO>;
  verifyOtp(data: verifyOtpDataDTO): Promise<RegisterResponseDTO>;
  resendOtp(data: string): Promise<ResendOtpResponseDTO>;
  forgotPassword(data: ForgotPasswordRequestDTO): Promise<ForgotPasswordResponseDTO>
  resetPassword(data: ResetPasswordDataDTO): Promise<ResetPasswordResponseDTO>;
  login(data: loginDataDTO): Promise<loginResponseDTO>;
}
