import { Roles } from "../config/roles";
import {
  OtpPurpose,
  OTP_EXPIRY_SECONDS,
  OTP_PREFIX,
  TEMP_USER_EXPIRY_SECONDS,
} from "../config/otpConfig";
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
  TechnicianQualification,
  TechnicianQualificationUpdateResponse,
  tempTechnicianResponse,
  verifyOtpData,
} from "../interfaces/DTO/IServices/ItechnicianService";
import { ItempTechnicianRepository } from "../interfaces/Irepositories/ItempTechnicianRepository";
import { ItechnicianRepository } from "../interfaces/Irepositories/ItechnicianRepository";
import { ItechnicianService } from "../interfaces/Iservices/ItechnicianService";
import { ItempTechnician } from "../interfaces/Models/ItempTechnician";
import { IemailService } from "../interfaces/Iemail/Iemail";
import { HTTP_STATUS } from "../utils/httpStatus";
import { IjwtService } from "../interfaces/Ijwt/Ijwt";
import { IOTPService } from "../interfaces/Iotp/IOTP";
import { IPasswordHasher } from "../interfaces/IpasswordHasher/IpasswordHasher";
import { IredisService } from "../interfaces/Iredis/Iredis";
import { OtpVerificationResult } from "../interfaces/Iotp/IOTP";
import { inject, injectable } from "tsyringe";
import { IFileUploader } from "../interfaces/IfileUploader/IfileUploader";

@injectable()
export class TechnicianService implements ItechnicianService {
  constructor(
    @inject("ItechnicianRepository")
    private technicianRepository: ItechnicianRepository,
    @inject("ItempTechnicianRepository")
    private tempTechnicianRepository: ItempTechnicianRepository,
    @inject("IemailService") private emailService: IemailService,
    @inject("IOTPService") private otpService: IOTPService,
    @inject("IPasswordHasher") private passwordService: IPasswordHasher,
    @inject("IjwtService") private jwtService: IjwtService,
    @inject("IredisService") private redisService: IredisService,
    @inject("IFileUploader") private fileUploader: IFileUploader,
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

  async technicianSignUp(
    data: SignupTechnicianData
  ): Promise<tempTechnicianResponse> {
    try {
      console.log(
        "entering to the techniciansignup function in the technicianauth service"
      );
      console.log("data:", data);
      const { email, password } = data;
      let result = await this.technicianRepository.findByEmail(email);
      if (result.success) {
        return {
          message: "technician already exists",
          success: false,
          status: HTTP_STATUS.BAD_REQUEST,
        };
      }
      const hashedPassword = await this.passwordService.hash(password);

      const otp = await this.generateAndSendOtp(email, OtpPurpose.REGISTRATION);

      console.log("Generated Otp for the Technician Registration:", otp);

      const expiresAt = new Date(Date.now() + TEMP_USER_EXPIRY_SECONDS * 1000);
      const tempTechnicianData = {
        ...data,
        password: hashedPassword,
        expiresAt,
      } as ItempTechnician;

      const response = await this.tempTechnicianRepository.createTempTechnician(
        tempTechnicianData
      );

      console.log("response in technicianService:", response);
      return {
        message: "Technician created successfully,OTP sent",
        email,
        tempTechnicianId: response.tempTechnicianId.toString(),
        success: true,
        status: HTTP_STATUS.CREATED,
      };
    } catch (error) {
      console.log("Error during technician signup:", error);
      throw new Error("An error occured during the technician signup");
    }
  }

  async verifyOtp(data: verifyOtpData): Promise<RegisterResponse> {
    try {
      console.log("entering to the verifyotp function in technicianService");

      const { otp, tempTechnicianId, email, purpose } = data;

      console.log("otp:", otp);
      console.log("tempTechnicianId:", tempTechnicianId);
      console.log("email:", email);
      console.log("purpose:", purpose);

      let technicianEmail = email;

      if (OtpPurpose.REGISTRATION === purpose && tempTechnicianId) {
        const tempTechnicianResponse =
          await this.tempTechnicianRepository.findTempTechnicianById(
            tempTechnicianId
          );
        console.log("tempTechnicianResponse:", tempTechnicianResponse);

        if (
          !tempTechnicianResponse.success ||
          !tempTechnicianResponse.tempTechnicianData
        ) {
          return {
            success: false,
            message: "Temporary Technician not found or expired",
            status: HTTP_STATUS.NOT_FOUND,
          };
        }
        const tempTechnician = tempTechnicianResponse.tempTechnicianData;
        technicianEmail = tempTechnician.email;

        const verificationResult = await this.verifyOtpGeneric(
          technicianEmail,
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

        const technicianData = {
          username: tempTechnician.username,
          email: tempTechnician.email,
          password: tempTechnician.password,
          phone: tempTechnician.phone,
        };

        const newTechnician = await this.technicianRepository.createTechnician(
          technicianData
        );
        console.log("new created technician:", newTechnician);

        const newTechnicianObj = newTechnician.toObject
          ? newTechnician.toObject()
          : { ...newTechnician };
        console.log("newUserObj:", newTechnicianObj);

        const { password, ...safeTechnician } = newTechnicianObj;
        console.log("safeTechnician:", safeTechnician);

        const redisKey = this.getOtpRedisKey(
          technicianEmail,
          OtpPurpose.REGISTRATION
        );
        await this.redisService.delete(redisKey);

        return {
          message: "OTP verified successfully, Technician registered",
          success: true,
          status: HTTP_STATUS.CREATED,
          userData: safeTechnician,
        };
      } else if (OtpPurpose.PASSWORD_RESET === purpose && technicianEmail) {
        console.log("password resetting in the userAuthService");
        const technician = await this.technicianRepository.findByEmail(
          technicianEmail
        );
        console.log("user from the password resetting:", technician);
        if (!technician.success || !technician.technicianData) {
          return {
            success: false,
            message: "Technician not found with this email",
            status: HTTP_STATUS.NOT_FOUND,
          };
        }

        const verificationResult = await this.verifyOtpGeneric(
          technicianEmail,
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

  async resendOtp(data: string): Promise<ResendOtpResponse> {
    try {
      console.log("entering resendotp function in the userservice");
      const tempTechnician =
        await this.tempTechnicianRepository.findTempTechnicianByEmail(data);
      console.log("temptechnician in resendotp user service:", tempTechnician);

      const technician = await this.technicianRepository.findByEmail(data);
      console.log("technician in the resendOtp in the user service");

      let purpose: OtpPurpose;

      if (tempTechnician.success && tempTechnician.tempTechnicianData) {
        purpose = OtpPurpose.REGISTRATION;
      } else if (technician.success && technician.technicianData) {
        purpose = OtpPurpose.PASSWORD_RESET;
      } else {
        return {
          success: false,
          message: "technician not found",
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
    data: ForgotPasswordRequest
  ): Promise<ForgotPasswordResponse> {
    try {
      console.log("Entering forgotPassword in userService");
      const { email } = data;

      const technician = await this.technicianRepository.findByEmail(email);
      if (!technician.success || !technician.technicianData) {
        return {
          success: false,
          message: "Technician not found with this email",
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

  async resetPassword(data: ResetPasswordData): Promise<ResetPasswordResponse> {
    try {
      console.log("Entering resetPassword in userService");
      const { email, password } = data;

      const technician = await this.technicianRepository.findByEmail(email);
      console.log("userData in resetPasssword:", technician);
      if (!technician.success || !technician.technicianData) {
        return {
          success: false,
          message: "User not found with this email",
          status: HTTP_STATUS.NOT_FOUND,
        };
      }

      const hashedPassword = await this.passwordService.hash(password);

      const updateResult = await this.technicianRepository.updatePassword(
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

  async login(data: loginData): Promise<loginResponse> {
    try {
      console.log("entering to the login credentials verifying in service");
      const { email, password } = data;
      const technician = await this.technicianRepository.findByEmail(email);
      console.log("technician", technician);
      if (!technician.success || !technician.technicianData) {
        return {
          success: false,
          message: "Technician not found",
          status: HTTP_STATUS.NOT_FOUND,
        };
      }

      const isPasswordValid = await this.passwordService.verify(
        technician.technicianData.password,
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

      if (technician.technicianData.status === "Blocked") {
        return {
          success: false,
          message: "Your account has been blocked. Please contact support.",
          status: HTTP_STATUS.UNAUTHORIZED,
        };
      }

      const technicianId = String(technician.technicianData._id);

      const access_token = this.jwtService.generateAccessToken(
        technicianId,
        Roles.TECHNICIAN
      );
      console.log("access_token:", access_token);
      const refresh_token = this.jwtService.generateRefreshToken(
        technicianId,
        Roles.TECHNICIAN
      );
      console.log("refresh_token:", refresh_token);

      return {
        success: true,
        message: "Login Successfull",
        access_token,
        refresh_token,
        role: Roles.TECHNICIAN,
        status: HTTP_STATUS.OK,
        technician: technician.technicianData,
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

  async submitTechnicianQualifications(
    technicianId: string,
    qualificationData: TechnicianQualification
  ): Promise<TechnicianQualificationUpdateResponse> {
    try {
      console.log(
        "Processing the technician qualification in the service layer"
      );

      const qualificationDataToSave: any = {
        experience: qualificationData.experience,
        designation: qualificationData.designation,
        city: qualificationData.city,
        preferredWorkLocation: qualificationData.preferredWorkLocation,
        about: qualificationData.about,
      };

      if (qualificationData.profilePhoto) {
        const profilePhotoUrl = await this.fileUploader.uploadFile(
          qualificationData.profilePhoto.path,
          { folder: "fixify/technicians/profile" }
        );
        if (profilePhotoUrl) {
          qualificationDataToSave.profilePhoto = profilePhotoUrl;
        }
      }

      if (
        qualificationData.certificates &&
        qualificationData.certificates.length > 0
      ) {
        const certificateUrls: string[] = [];
        for (const certificate of qualificationData.certificates) {
          const certificateUrl = await this.fileUploader.uploadFile(
            certificate.path,
            { folder: "fixify/technicians/certificates" }
          );
          if (certificateUrl) {
            certificateUrls.push(certificateUrl);
          }
        }
        if (certificateUrls.length > 0) {
          qualificationDataToSave.certificates = certificateUrls;
        }
      }

      const result =
        await this.technicianRepository.updateTechnicianQualification(
          technicianId,
          qualificationDataToSave
        );

      console.log("result from the technician service:", result);

      return {
        message: "Qualification submitted successfully",
        success: true,
        status: HTTP_STATUS.OK,
        technician: result.technician,
      };
    } catch (error) {
      console.error("Error submitting technician qualification:", error);
      return {
        message: "Failed to submit qualification",
        success: false,
        status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
      };
    }
  }

   async getTechnicianProfile(
      technicianId: string
    ): Promise<TechnicianProfileResponse> {
      try {
        console.log(
          "Fetching technician profile in service layer for ID:",
          technicianId
        );
  
        const result = await this.technicianRepository.getTechnicianById(
          technicianId
        );
  
        if (!result.success || !result.technicianData) {
          return {
            message: result.message || "Technician not found",
            success: false,
            status: HTTP_STATUS.NOT_FOUND,
          };
        }
  
        return {
          message: "Technician profile fetched successfully",
          success: true,
          status: HTTP_STATUS.OK,
          technician: {
            username: result.technicianData.username,
            email: result.technicianData.email,
            phone: result.technicianData.phone,
            is_verified: result.technicianData.is_verified,
            yearsOfExperience: result.technicianData.yearsOfExperience,
            Designation: result.technicianData.Designation,
            city: result.technicianData.city,
            preferredWorkLocation: result.technicianData.preferredWorkLocation,
            About: result.technicianData.About,
            image: result.technicianData.image,
            certificates: result.technicianData.certificates,
          },
        };
      } catch (error) {
        console.error("Error fetching technician profile:", error);
        return {
          message: "Failed to fetch technician profile",
          success: false,
          status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
        };
      }
    }
}
