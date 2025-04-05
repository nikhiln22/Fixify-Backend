import { loginDataDTO, loginResposnseDTO, RegisterResponseDTO, SignupUserDataDTO, tempUserResponseDTO, verifyOtpDataDTO } from "../DTO/IServices/userService.dto";

export interface IuserService {
    userSignUp(data: SignupUserDataDTO): Promise<tempUserResponseDTO>
    verifyOtp(data: verifyOtpDataDTO): Promise<RegisterResponseDTO>
    login(data: loginDataDTO): Promise<loginResposnseDTO>
}