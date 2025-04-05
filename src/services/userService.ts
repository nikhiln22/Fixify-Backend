import { Roles } from "../config/roles";
import {
  loginDataDTO,
  loginResposnseDTO,
  RegisterResponseDTO,
  SignupUserDataDTO,
  tempUserResponseDTO,
  verifyOtpDataDTO,
} from "../interfaces/DTO/IServices/userService.dto";
import { IuserRepository } from "../interfaces/Irepositories/IuserRepository";
import { IuserService } from "../interfaces/Iservices/IuserService";
import { ItempUser } from "../interfaces/Models/ItempUser";
import { EmailService } from "../utils/email";
import { HTTP_STATUS } from "../utils/httpStatus";
import { JWTService } from "../utils/jwt";
import { OTPService } from "../utils/otp";
import { PasswordHasher } from "../utils/password";

export class UserService implements IuserService {
  private userRepository: IuserRepository;
  private emailService: EmailService;
  private otpService: OTPService;
  private passwordService: PasswordHasher;
  private jwtService: JWTService;

  constructor(
    userRepo: IuserRepository,
    emailService: EmailService,
    otpService: OTPService,
    passwordService: PasswordHasher,
    jwtService: JWTService
  ) {
    this.userRepository = userRepo;
    this.emailService = emailService;
    this.otpService = otpService;
    this.passwordService = passwordService;
    this.jwtService = jwtService;
  }

  async userSignUp(data: SignupUserDataDTO): Promise<tempUserResponseDTO> {
    try {
      console.log("userData:", data);
      const { email, password } = data;
      let result = await this.userRepository.findByEmail(email);
      if (result.success) {
        return {
          message: "user already exists",
          success: false,
          status: HTTP_STATUS.BAD_REQUEST,
        };
      }
      const hashedPassword = await this.passwordService.hash(password);
      const otp = this.otpService.generateOtp();
      console.log("Generated OTP:", otp);
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
      const tempUserData = {
        ...data,
        password: hashedPassword,
        otp,
        expiresAt,
      } as ItempUser;

      const response = await this.userRepository.createTempUser(tempUserData);
      await this.emailService.sendOtpEmail(email, otp);
      console.log("response in userService:", response);
      return {
        message: "User created successfully,OTP sent",
        email,
        tempUserId: response.tempUserId.toString(),
        success: true,
        status: HTTP_STATUS.CREATED,
      };
    } catch (error) {
      console.log("Error during user signup:", error);
      throw new Error("An error occured during the user signup");
    }
  }

  async verifyOtp(data: verifyOtpDataDTO): Promise<RegisterResponseDTO> {
    try {
      console.log("entering to the verifyotp function in userService");
      console.log("data:", data);
      const { otp, tempUserId } = data;
      const tempUserResponse = await this.userRepository.findTempUserById(
        tempUserId
      );
      console.log("tempUser:", tempUserResponse);
      if (!tempUserResponse.success || !tempUserResponse.tempUserData) {
        return {
          success: false,
          message: "Temporary user not found or expired",
          status: HTTP_STATUS.NOT_FOUND,
        };
      }
      const tempUser = tempUserResponse.tempUserData;
      if (tempUser.otp !== otp) {
        return {
          success: false,
          message: "Invalid OTP",
          status: HTTP_STATUS.UNAUTHORIZED,
        };
      }
      const userData = {
        username: tempUser.username,
        email: tempUser.email,
        password: tempUser.password,
        phone: tempUser.phone,
      };
      const newUser = await this.userRepository.createUser(userData);
      console.log("new created user:", newUser);

      const newUserObj = newUser.toObject ? newUser.toObject() : { ...newUser };
      console.log("newUserObj:", newUserObj);

      const { password, ...safeUser } = newUserObj;

      console.log("safeUser:", safeUser);

      return {
        message: "OTP verified successfully, user registered",
        success: true,
        status: HTTP_STATUS.CREATED,
        data: safeUser,
      };
    } catch (error) {
      console.log("Error during OTP verification:", error);
      return {
        success: false,
        message: "An error occured during the otp verification",
        status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
      };
    }
  }

  async login(data: loginDataDTO): Promise<loginResposnseDTO> {
    try {
      console.log("entering to the login credentials verifying in service");
      const { email, password } = data;
      const user = await this.userRepository.findByEmail(email);
      console.log("user", user);
      if (!user.success || !user.userData) {
        return {
          success: false,
          message: "user not found",
          status: HTTP_STATUS.NOT_FOUND,
        };
      }

      const isPasswordValid = await this.passwordService.verify(
        user.userData.password,
        password
      );
      console.log("isPasswordValid:", isPasswordValid);

      if (!isPasswordValid) {
        return {
          success: false,
          message: "invalid password",
          status: HTTP_STATUS.NOT_FOUND,
        };
      }

      const userId = String(user.userData._id);

      const access_token = this.jwtService.generateAccessToken(
        userId,
        Roles.USER
      );
      console.log("access_token:", access_token);
      const refresh_token = this.jwtService.generateRefreshToken(
        userId,
        Roles.USER
      );
      console.log("refresh_token:", refresh_token);

      return {
        success: true,
        message: "Login Successfull",
        userId: userId,
        access_token,
        refresh_token,
        status: HTTP_STATUS.OK,
      };
    } catch (error) {
      console.log("error");
      return {
        success: false,
        message: "error occured during the login",
        status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
      };
    }
  }
}
