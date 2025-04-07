import {
  loginDataDTO,
  loginResposnseDTO,
  RegisterResponseDTO,
  ResendOtpResponseDTO,
  SignupUserDataDTO,
  tempUserResponseDTO,
  verifyOtpDataDTO,
} from "../DTO/IServices/userService.dto";

export interface IuserService {
  userSignUp(data: SignupUserDataDTO): Promise<tempUserResponseDTO>;
  verifyOtp(data: verifyOtpDataDTO): Promise<RegisterResponseDTO>;
  resendOtp(data: string): Promise<ResendOtpResponseDTO>;
  login(data: loginDataDTO): Promise<loginResposnseDTO>;
}
