import { Roles } from "../../config/roles";
import {
  OtpPurpose,
  OTP_EXPIRY_SECONDS,
  OTP_PREFIX,
  TEMP_USER_EXPIRY_SECONDS,
} from "../../config/otpConfig";
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
} from "../../interfaces/DTO/IServices/Iuserservices.dto/userAuthService.dto";
import { ItempUserRepository } from "../../interfaces/Irepositories/ItempUserRepository";
import { IuserRepository } from "../../interfaces/Irepositories/IuserRepository";
import { IuserAuthService } from "../../interfaces/Iservices/IuserService/IuserAuthService";
import { ItempUser } from "../../interfaces/Models/ItempUser";
import { IemailService } from "../../interfaces/Iemail/Iemail";
import { HTTP_STATUS } from "../../utils/httpStatus";
import { IjwtService } from "../../interfaces/Ijwt/Ijwt";
import { IOTPService } from "../../interfaces/Iotp/IOTP";
import { IPasswordHasher } from "../../interfaces/IpasswordHasher/IpasswordHasher";
import { IredisService } from "../../interfaces/Iredis/Iredis";
import { OtpVerificationResult } from "../../interfaces/Iotp/IOTP";
import { inject, injectable } from "tsyringe";


@injectable()
export class UserAuthService implements IuserAuthService {
  constructor(
    @inject("IuserRepository") private userRepository: IuserRepository,
    @inject("ItempUserRepository")
    private tempUserRepository: ItempUserRepository,
    @inject("IemailService") private emailService: IemailService,
    @inject("IOTPService") private otpService: IOTPService,
    @inject("IPasswordHasher") private passwordService: IPasswordHasher,
    @inject("IjwtService") private jwtService: IjwtService,
    @inject("IredisService") private redisService: IredisService
  ) {}

  private getOtpRedisKey(email: string, purpose: OtpPurpose): string {
    return `${OTP_PREFIX}${purpose}:${email}`;
  }

  private async generateAndSendOtp(
    email: string,
    purpose: OtpPurpose
  ): Promise<string> {
    const otp = await this.otpService.generateOtp();
    console.log(`Generated Otp for ${purpose}:`, otp);

    const redisKey = this.getOtpRedisKey(email, purpose);

    console.log("generated RedisKey:", redisKey);

    await this.redisService.set(redisKey, otp, OTP_EXPIRY_SECONDS);

    if (purpose === OtpPurpose.PASSWORD_RESET) {
      await this.emailService.sendPasswordResetEmail(email, otp);
    } else {
      await this.emailService.sendOtpEmail(email, otp);
    }
    return otp;
  }

  private async verifyOtpGeneric(
    email: string,
    otp: string,
    purpose: OtpPurpose
  ): Promise<OtpVerificationResult> {
    const redisKey = this.getOtpRedisKey(email, purpose);
    const storedOtp = await this.redisService.get(redisKey);

    if (!storedOtp) {
      return {
        success: false,
        message: "OTP has expired or doesn't exist. Please request a new one",
        status: HTTP_STATUS.BAD_REQUEST,
      };
    }

    if (storedOtp !== otp) {
      return {
        success: false,
        message: "Invalid OTP",
        status: HTTP_STATUS.UNAUTHORIZED,
      };
    }

    return {
      success: true,
      message: "OTP verified successfully",
      status: HTTP_STATUS.OK,
      email,
    };
  }

  async userSignUp(data: SignupUserDataDTO): Promise<tempUserResponseDTO> {
    try {
      console.log(
        "entering to the usersignup function in the userauth service"
      );
      console.log("data:", data);
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

      const otp = await this.generateAndSendOtp(email, OtpPurpose.REGISTRATION);

      console.log("Generated Otp for the user Registration:", otp);

      const expiresAt = new Date(Date.now() + TEMP_USER_EXPIRY_SECONDS * 1000);
      const tempUserData = {
        ...data,
        password: hashedPassword,
        expiresAt,
      } as ItempUser;

      const response = await this.tempUserRepository.createTempUser(
        tempUserData
      );

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

      const { otp, tempUserId, email, purpose } = data;

      let userEmail = email;

      if (OtpPurpose.REGISTRATION === purpose && tempUserId) {
        const tempUserResponse = await this.tempUserRepository.findTempUserById(
          tempUserId
        );
        console.log("tempUserResponse:", tempUserResponse);

        if (!tempUserResponse.success || !tempUserResponse.tempUserData) {
          return {
            success: false,
            message: "Temporary user not found or expired",
            status: HTTP_STATUS.NOT_FOUND,
          };
        }
        const tempUser = tempUserResponse.tempUserData;
        userEmail = tempUser.email;

        const verificationResult = await this.verifyOtpGeneric(
          userEmail,
          otp,
          OtpPurpose.REGISTRATION
        );

        if (!verificationResult.success) {
          return {
            success: false,
            message: verificationResult.message,
            status: verificationResult.status,
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

        const newUserObj = newUser.toObject
          ? newUser.toObject()
          : { ...newUser };
        console.log("newUserObj:", newUserObj);

        const { password, ...safeUser } = newUserObj;
        console.log("safeUser:", safeUser);

        const redisKey = this.getOtpRedisKey(
          userEmail,
          OtpPurpose.REGISTRATION
        );
        await this.redisService.delete(redisKey);

        return {
          message: "OTP verified successfully, user registered",
          success: true,
          status: HTTP_STATUS.CREATED,
          userData: safeUser,
        };
      } else if (OtpPurpose.PASSWORD_RESET === purpose && userEmail) {
        console.log("password resetting in the userAuthService");
        const user = await this.userRepository.findByEmail(userEmail);
        console.log("user from the password resetting:", user);
        if (!user.success || !user.userData) {
          return {
            success: false,
            message: "User not found with this email",
            status: HTTP_STATUS.NOT_FOUND,
          };
        }

        const verificationResult = await this.verifyOtpGeneric(
          userEmail,
          otp,
          OtpPurpose.PASSWORD_RESET
        );

        return verificationResult;
      } else {
        return {
          success: false,
          message: "Invalid verification request",
          status: HTTP_STATUS.BAD_REQUEST,
        };
      }
    } catch (error) {
      console.log("Error during OTP verification:", error);
      return {
        success: false,
        message: "An error occured during the otp verification",
        status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
      };
    }
  }

  async resendOtp(data: string): Promise<ResendOtpResponseDTO> {
    try {
      console.log("entering resendotp function in the userservice");
      const tempUser = await this.tempUserRepository.findTempUserByEmail(data);
      console.log("tempuser in resendotp user service:", tempUser);

      const user = await this.userRepository.findByEmail(data);
      console.log("user in the resendOtp in the user service");

      let purpose: OtpPurpose;

      if (tempUser.success && tempUser.tempUserData) {
        purpose = OtpPurpose.REGISTRATION;
      } else if (user.success && user.userData) {
        purpose = OtpPurpose.PASSWORD_RESET;
      } else {
        return {
          success: false,
          message: "User not found",
          status: HTTP_STATUS.NOT_FOUND,
        };
      }

      const newOtp = await this.generateAndSendOtp(data, purpose);

      console.log("generated new Otp:", newOtp);

      return {
        success: true,
        message: `OTP sent successfully for ${
          purpose === OtpPurpose.REGISTRATION
            ? "registration"
            : "password reset"
        }`,
        status: HTTP_STATUS.OK,
      };
    } catch (error) {
      console.log("error occured while resending the otp", error);
      return {
        success: false,
        message: "Error occured while resending the otp",
        status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
      };
    }
  }

  async forgotPassword(
    data: ForgotPasswordRequestDTO
  ): Promise<ForgotPasswordResponseDTO> {
    try {
      console.log("Entering forgotPassword in userService");
      const { email } = data;

      const user = await this.userRepository.findByEmail(email);
      if (!user.success || !user.userData) {
        return {
          success: false,
          message: "User not found with this email",
          status: HTTP_STATUS.NOT_FOUND,
        };
      }

      const otp = await this.generateAndSendOtp(
        email,
        OtpPurpose.PASSWORD_RESET
      );
      console.log("Generated OTP for password reset:", otp);

      return {
        success: true,
        message: "Password reset OTP sent to your email",
        email,
        status: HTTP_STATUS.OK,
      };
    } catch (error) {
      console.log("Error during forgot password:", error);
      return {
        success: false,
        message: "An error occurred during password reset process",
        status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
      };
    }
  }

  async resetPassword(
    data: ResetPasswordDataDTO
  ): Promise<ResetPasswordResponseDTO> {
    try {
      console.log("Entering resetPassword in userService");
      const { email, password } = data;

      const user = await this.userRepository.findByEmail(email);
      console.log("userData in resetPasssword:", user);
      if (!user.success || !user.userData) {
        return {
          success: false,
          message: "User not found with this email",
          status: HTTP_STATUS.NOT_FOUND,
        };
      }

      const hashedPassword = await this.passwordService.hash(password);

      const updateResult = await this.userRepository.updatePassword(
        email,
        hashedPassword
      );

      if (!updateResult.success) {
        return {
          success: false,
          message: "Failed to update password",
          status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
        };
      }

      const redisKey = `forgotPassword:${email}`;
      await this.redisService.delete(redisKey);

      return {
        success: true,
        message: "Password reset successful",
        status: HTTP_STATUS.OK,
      };
    } catch (error) {
      console.log("Error during password reset:", error);
      return {
        success: false,
        message: "An error occurred during password reset",
        status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
      };
    }
  }

  async login(data: loginDataDTO): Promise<loginResponseDTO> {
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

      if (!isPasswordValid) {
        return {
          success: false,
          message: "invalid password",
          status: HTTP_STATUS.NOT_FOUND,
        };
      }

      if (user.userData.status === "Blocked") {
        return {
          success: false,
          message: "Your account has been blocked. Please contact support.",
          status: HTTP_STATUS.BAD_REQUEST,
        };
      }

      const userId = String(user.userData._id);

      const access_token = this.jwtService.generateAccessToken(
        userId,
        Roles.USER
      );

      const refresh_token = this.jwtService.generateRefreshToken(
        userId,
        Roles.USER
      );

      return {
        success: true,
        message: "Login Successfull",
        access_token,
        refresh_token,
        role: Roles.USER,
        status: HTTP_STATUS.OK,
        user: {
          username: user.userData.username,
          email: user.userData.email,
          phone: user.userData.phone,
        },
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

  async checkUserStatus(
    userId: string
  ): Promise<{ success: boolean; message: string; status: number }> {
    try {
      console.log(
        "checking whether the user is blocked from the userAuthService"
      );
      const userData = await this.userRepository.findById(userId);

      console.log(
        "userData from the checkuserstatus in user repository:",
        userData
      );

      if (!userData) {
        return {
          success: false,
          message: "User not found",
          status: HTTP_STATUS.NOT_FOUND,
        };
      }

      if (userData.status === "Blocked") {
        return {
          success: false,
          message: "Your account has been blocked by an administrator",
          status: HTTP_STATUS.FORBIDDEN,
        };
      }
      return {
        success: true,
        message: "User is active",
        status: HTTP_STATUS.OK,
      };
    } catch (error) {
      console.log("Error checking user status:", error);
      return {
        success: false,
        message: "Error checking user status",
        status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
      };
    }
  }
}
