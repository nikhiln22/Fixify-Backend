import { Roles } from "../config/roles";
import {
  OtpPurpose,
  OTP_EXPIRY_SECONDS,
  OTP_PREFIX,
  TEMP_USER_EXPIRY_SECONDS,
} from "../config/otpConfig";
import { EmailType, APP_NAME } from "../config/emailConfig";
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
  TechnicianQualification,
  TechnicianQualificationUpdateResponse,
  tempTechnicianResponse,
  ToggleTechnicianStatusResponse,
  verifyOtpData,
  VerifyTechnicianServiceResponse,
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
import { Itechnician } from "../interfaces/Models/Itechnician";
import { IWalletRepository } from "../interfaces/Irepositories/IwalletRepository";

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
    @inject("IWalletRepository") private walletRepository: IWalletRepository
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

      let technicianEmail: string;

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

        const newWallet = await this.walletRepository.createWallet(
          newTechnician._id.toString()
        );

        console.log("newly created wallet:", newWallet);

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
      } else if (OtpPurpose.PASSWORD_RESET === purpose && email) {
        console.log("password resetting in the technican Service");
        technicianEmail = email;

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
      console.log("entering resendotp function in the technician service");
      const tempTechnician =
        await this.tempTechnicianRepository.findTempTechnicianByEmail(data);
      console.log(
        "temptechnician in resendotp technician service:",
        tempTechnician
      );

      const technician = await this.technicianRepository.findByEmail(data);
      console.log("technician in the resendOtp in the technician service");

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
      console.log("Entering forgotPassword in technician Service");
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
      console.log("Entering resetPassword in technician Service");
      const { email, password } = data;

      const technician = await this.technicianRepository.findByEmail(email);
      console.log("userData in resetPasssword:", technician);
      if (!technician.success || !technician.technicianData) {
        return {
          success: false,
          message: "technician not found with this email",
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

      const redisKey = this.getOtpRedisKey(email, OtpPurpose.PASSWORD_RESET);
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

      if (technician.technicianData.status === "InActive") {
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

      console.log(
        "technician Id in the service layer for qualification updating:",
        technicianId
      );

      const qualificationDataToSave: any = {
        experience: qualificationData.experience,
        designation: qualificationData.designation,
        longitude: qualificationData.longitude,
        latitude: qualificationData.latitude,
        address: qualificationData.address,
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

  async getAllApplicants(options: { page?: number; limit?: number }): Promise<{
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
  }> {
    try {
      console.log("Function fetching all the applcants");
      const page = options.page || 1;
      const limit = options.limit || 5;
      const result = await this.technicianRepository.getAllApplicants({
        page,
        limit,
      });

      console.log("result from the technician service:", result);

      return {
        success: true,
        status: HTTP_STATUS.OK,
        message: "technicians fetched successfully",
        data: {
          applicants: result.data,
          pagination: {
            total: result.total,
            page: result.page,
            pages: result.pages,
            limit: limit,
            hasNextPage: result.page < result.pages,
            hasPrevPage: page > 1,
          },
        },
      };
    } catch (error) {
      console.error("Error fetching applicants:", error);
      return {
        success: false,
        status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
        message: "Something went wrong while fetching applicants",
      };
    }
  }

  async getTechnicianProfile(
    technicianId: string
  ): Promise<TechnicianProfileResponse> {
    try {
      console.log(
        "Fetching technician profile in technician service for ID:",
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
          Designation: (result.technicianData.Designation as any).designation,
          address: result.technicianData.address,
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

  async verifyTechnician(
    technicianId: string
  ): Promise<VerifyTechnicianServiceResponse> {
    try {
      console.log("Verifying technician in service layer:", technicianId);

      const technicianResult =
        await this.technicianRepository.getTechnicianById(technicianId);

      if (!technicianResult.success || !technicianResult.technicianData) {
        return {
          success: false,
          message: "Technician not found",
          status: HTTP_STATUS.NOT_FOUND,
        };
      }

      const technician = technicianResult.technicianData;

      const verificationResult =
        await this.technicianRepository.verifyTechnician(technicianId);

      if (!verificationResult.success) {
        return {
          success: false,
          message: verificationResult.message,
          status: HTTP_STATUS.BAD_REQUEST,
        };
      }

      try {
        const emailData = {
          technicianName: technician.username,
        };

        const emailContent = this.emailService.generateEmailContent(
          EmailType.VERIFICATION_SUCCESS,
          emailData
        );

        await this.emailService.sendEmail({
          to: technician.email,
          subject: `Welcome to ${APP_NAME} - Application Approved!`,
          html: emailContent.html,
          text: emailContent.text,
        });

        console.log("Verification success email sent to:", technician.email);
      } catch (emailError) {
        console.log("Error sending verification email:", emailError);
      }

      return {
        success: true,
        message: "Technician verified successfully and notification email sent",
        status: HTTP_STATUS.OK,
      };
    } catch (error) {
      console.log("Error during technician verification:", error);
      return {
        success: false,
        message: "An error occurred during technician verification",
        status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
      };
    }
  }

  async rejectTechnician(
    technicianId: string,
    reason?: string
  ): Promise<RejectTechnicianServiceResponse> {
    try {
      console.log("Rejecting technician in service layer:", technicianId);

      const technicianResult =
        await this.technicianRepository.getTechnicianById(technicianId);

      if (!technicianResult.success || !technicianResult.technicianData) {
        return {
          success: false,
          message: "Technician not found",
          status: HTTP_STATUS.NOT_FOUND,
        };
      }

      const technician = technicianResult.technicianData;

      const rejectionResult = await this.technicianRepository.rejectTechnician(
        technicianId
      );

      if (!rejectionResult.success) {
        return {
          success: false,
          message: rejectionResult.message,
          status: HTTP_STATUS.BAD_REQUEST,
        };
      }

      try {
        const emailData = {
          technicianName: technician.username,
          reason: reason || "Application did not meet our current requirements",
        };

        const emailContent = this.emailService.generateEmailContent(
          EmailType.APPLICATION_REJECTED,
          emailData
        );

        await this.emailService.sendEmail({
          to: technician.email,
          subject: `${APP_NAME} - Application Update`,
          html: emailContent.html,
          text: emailContent.text,
        });

        console.log("Rejection email sent to:", technician.email);
      } catch (emailError) {
        console.log("Error sending rejection email:", emailError);
      }

      return {
        success: true,
        message:
          "Technician application rejected successfully and notification email sent",
        status: HTTP_STATUS.OK,
      };
    } catch (error) {
      console.log("Error during technician rejection:", error);
      return {
        success: false,
        message: "An error occurred during technician rejection",
        status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
      };
    }
  }

  async getAllTechnicians(options: {
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
  }> {
    try {
      console.log("Function fetching all the technicians");
      const page = options.page || 1;
      const limit = options.limit || 5;
      const result = await this.technicianRepository.getAllTechnicians({
        page,
        limit,
        search: options.search,
        status: options.status,
        designation: options.designation,
      });

      console.log("result from the technician service:", result);

      return {
        success: true,
        status: HTTP_STATUS.OK,
        message: "Technicians fetched successfully",
        data: {
          technicians: result.data,
          pagination: {
            total: result.total,
            page: result.page,
            pages: result.pages,
            limit: limit,
            hasNextPage: result.page < result.pages,
            hasPrevPage: page > 1,
          },
        },
      };
    } catch (error) {
      console.error("Error fetching technicians:", error);
      return {
        success: false,
        status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
        message: "Something went wrong while fetching users",
      };
    }
  }

  async getNearbyTechnicians(
    designationId: string,
    userLongitude: number,
    userLatitude: number,
    radius: number
  ): Promise<{
    success: boolean;
    status: number;
    message: string;
    data?: Itechnician[];
  }> {
    try {
      console.log(
        "designationId in the getNearByTechnicians service:",
        designationId
      );
      console.log(
        "user longitude in the getNearByTechnicians service:",
        userLongitude
      );
      console.log(
        "user latitude in the getNearByTechnicians service:",
        userLatitude
      );
      console.log("radius in the getNearByTechnicians service:", radius);

      // Validate input parameters
      if (!designationId || !userLongitude || !userLatitude) {
        return {
          success: false,
          message:
            "Missing required parameters: designationId, longitude, or latitude",
          status: HTTP_STATUS.BAD_REQUEST,
        };
      }

      const nearbyTechnicians =
        await this.technicianRepository.nearbyTechnicians(
          designationId,
          userLongitude,
          userLatitude,
          radius
        );

      console.log(
        "nearby technicians in the technician service:",
        nearbyTechnicians
      );

      return {
        success: true,
        message: `Found ${nearbyTechnicians.length} nearby technicians within ${radius}km`,
        status: HTTP_STATUS.OK,
        data: nearbyTechnicians,
      };
    } catch (error) {
      console.log(
        "error occurred while fetching the nearby technicians:",
        error
      );
      return {
        success: false,
        message: "An error occurred while fetching nearby technicians",
        status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
      };
    }
  }

  async toggleTechnicianStatus(
    id: string
  ): Promise<ToggleTechnicianStatusResponse> {
    try {
      console.log("toogling hte technician status in the service layer:", id);
      const technicianResult =
        await this.technicianRepository.getTechnicianById(id);
      if (!technicianResult.success || !technicianResult.technicianData) {
        return {
          success: false,
          message: "TeChnician not found",
          status: HTTP_STATUS.OK,
        };
      }
      const currentTechnician = technicianResult.technicianData;

      if (!currentTechnician.is_verified) {
        return {
          success: false,
          message: "Cannot toggle status of unverified technician",
          status: HTTP_STATUS.BAD_REQUEST,
        };
      }

      const newStatus =
        currentTechnician.status === "Active" ? "Blocked" : "Active";

      const toggleResult =
        await this.technicianRepository.toggleTechnicianStatus(id, newStatus);

      return {
        success: true,
        message: `Technician ${newStatus.toLowerCase()} successfully`,
        status: HTTP_STATUS.OK,
        technician: toggleResult.technicianData,
      };
    } catch (error) {
      console.log("Error during technician status toggle:", error);
      return {
        success: false,
        message: "An error occurred while toggling technician status",
        status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
      };
    }
  }
}
