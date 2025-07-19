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
  LoginData,
  LoginResponse,
  RegisterResponse,
  RejectTechnicianServiceResponse,
  ResendOtpResponse,
  ResetPasswordData,
  ResetPasswordResponse,
  SignupTechnicianData,
  TechnicianProfileResponse,
  TechnicianQualification,
  TechnicianQualificationUpdateResponse,
  TempTechnicianResponse,
  ToggleTechnicianStatusResponse,
  VerifyOtpData,
  VerifyTechnicianServiceResponse,
} from "../interfaces/DTO/IServices/ItechnicianService";
import { ITempTechnicianRepository } from "../interfaces/Irepositories/ItempTechnicianRepository";
import { ITechnicianRepository } from "../interfaces/Irepositories/ItechnicianRepository";
import { ITechnicianService } from "../interfaces/Iservices/ItechnicianService";
import { ITempTechnician } from "../interfaces/Models/ItempTechnician";
import { IEmailService } from "../interfaces/Iemail/Iemail";
import { IJwtService } from "../interfaces/Ijwt/Ijwt";
import { IOTPService } from "../interfaces/Iotp/IOTP";
import { IPasswordHasher } from "../interfaces/IpasswordHasher/IpasswordHasher";
import { IRedisService } from "../interfaces/Iredis/Iredis";
import { OtpVerificationResult } from "../interfaces/Iotp/IOTP";
import { inject, injectable } from "tsyringe";
import { IFileUploader } from "../interfaces/IfileUploader/IfileUploader";
import { ITechnician } from "../interfaces/Models/Itechnician";
import { IWalletRepository } from "../interfaces/Irepositories/IwalletRepository";
import { IWalletTransaction } from "../interfaces/Models/IwalletTransaction";
import { IWalletTransactionRepository } from "../interfaces/Irepositories/IwalletTransactionRepository";
import { IRatingRepository } from "../interfaces/Irepositories/IratingRepository";
import { IRating } from "../interfaces/Models/Irating";

@injectable()
export class TechnicianService implements ITechnicianService {
  constructor(
    @inject("ITechnicianRepository")
    private _technicianRepository: ITechnicianRepository,
    @inject("ITempTechnicianRepository")
    private _tempTechnicianRepository: ITempTechnicianRepository,
    @inject("IEmailService") private _emailService: IEmailService,
    @inject("IOTPService") private _otpService: IOTPService,
    @inject("IPasswordHasher") private _passwordService: IPasswordHasher,
    @inject("IJwtService") private _jwtService: IJwtService,
    @inject("IRedisService") private _redisService: IRedisService,
    @inject("IFileUploader") private _fileUploader: IFileUploader,
    @inject("IWalletRepository") private _walletRepository: IWalletRepository,
    @inject("IWalletTransactionRepository")
    private _walletTransactionRepository: IWalletTransactionRepository,
    @inject("IRatingRepository") private _ratingRepository: IRatingRepository
  ) {}

  private getOtpRedisKey(email: string, purpose: OtpPurpose): string {
    return `${OTP_PREFIX}${purpose}:${email}`;
  }

  private async generateAndSendOtp(
    email: string,
    purpose: OtpPurpose
  ): Promise<string> {
    const otp = await this._otpService.generateOtp();
    console.log(`Generated Otp for ${purpose}:`, otp);

    const redisKey = this.getOtpRedisKey(email, purpose);

    console.log("generated RedisKey:", redisKey);

    await this._redisService.set(redisKey, otp, OTP_EXPIRY_SECONDS);

    if (purpose === OtpPurpose.PASSWORD_RESET) {
      await this._emailService.sendPasswordResetEmail(email, otp);
    } else {
      await this._emailService.sendOtpEmail(email, otp);
    }
    return otp;
  }

  private async verifyOtpGeneric(
    email: string,
    otp: string,
    purpose: OtpPurpose
  ): Promise<OtpVerificationResult> {
    const redisKey = this.getOtpRedisKey(email, purpose);
    const storedOtp = await this._redisService.get(redisKey);

    if (!storedOtp) {
      return {
        success: false,
        message: "OTP has expired or doesn't exist. Please request a new one",
      };
    }

    if (storedOtp !== otp) {
      return {
        success: false,
        message: "Invalid OTP",
      };
    }

    return {
      success: true,
      message: "OTP verified successfully",
      email,
    };
  }

  async technicianSignUp(
    data: SignupTechnicianData
  ): Promise<TempTechnicianResponse> {
    try {
      console.log(
        "entering to the techniciansignup function in the technicianauth service"
      );
      console.log("data:", data);
      const { email, password } = data;
      const result = await this._technicianRepository.findByEmail(email);
      if (result.success) {
        return {
          message: "technician already exists",
          success: false,
        };
      }
      const hashedPassword = await this._passwordService.hash(password);

      const otp = await this.generateAndSendOtp(email, OtpPurpose.REGISTRATION);

      console.log("Generated Otp for the Technician Registration:", otp);

      const expiresAt = new Date(Date.now() + TEMP_USER_EXPIRY_SECONDS * 1000);
      const tempTechnicianData = {
        ...data,
        password: hashedPassword,
        expiresAt,
      } as ITempTechnician;

      const response =
        await this._tempTechnicianRepository.createTempTechnician(
          tempTechnicianData
        );

      console.log("response in technicianService:", response);
      return {
        message: "Technician created successfully,OTP sent",
        email,
        tempTechnicianId: response.tempTechnicianId.toString(),
        success: true,
      };
    } catch (error) {
      console.log("Error during technician signup:", error);
      throw new Error("An error occured during the technician signup");
    }
  }

  async verifyOtp(data: VerifyOtpData): Promise<RegisterResponse> {
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
          await this._tempTechnicianRepository.findTempTechnicianById(
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
          };
        }

        const technicianData = {
          username: tempTechnician.username,
          email: tempTechnician.email,
          password: tempTechnician.password,
          phone: tempTechnician.phone,
        };

        const newTechnician = await this._technicianRepository.createTechnician(
          technicianData
        );
        console.log("new created technician:", newTechnician);

        const newWallet = await this._walletRepository.createWallet(
          newTechnician._id.toString(),
          "technician"
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
        await this._redisService.delete(redisKey);

        return {
          message: "OTP verified successfully, Technician registered",
          success: true,
          userData: safeTechnician,
        };
      } else if (OtpPurpose.PASSWORD_RESET === purpose && email) {
        console.log("password resetting in the technican Service");
        technicianEmail = email;

        const technician = await this._technicianRepository.findByEmail(
          technicianEmail
        );
        console.log("user from the password resetting:", technician);
        if (!technician.success || !technician.technicianData) {
          return {
            success: false,
            message: "Technician not found with this email",
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
        };
      }
    } catch (error) {
      console.log("Error during OTP verification:", error);
      return {
        success: false,
        message: "An error occured during the otp verification",
      };
    }
  }

  async resendOtp(data: string): Promise<ResendOtpResponse> {
    try {
      console.log("entering resendotp function in the technician service");
      const tempTechnician =
        await this._tempTechnicianRepository.findTempTechnicianByEmail(data);
      console.log(
        "temptechnician in resendotp technician service:",
        tempTechnician
      );

      const technician = await this._technicianRepository.findByEmail(data);
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
      };
    } catch (error) {
      console.log("error occured while resending the otp", error);
      return {
        success: false,
        message: "Error occured while resending the otp",
      };
    }
  }

  async forgotPassword(
    data: ForgotPasswordRequest
  ): Promise<ForgotPasswordResponse> {
    try {
      console.log("Entering forgotPassword in technician Service");
      const { email } = data;

      const technician = await this._technicianRepository.findByEmail(email);
      if (!technician.success || !technician.technicianData) {
        return {
          success: false,
          message: "Technician not found with this email",
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
      };
    } catch (error) {
      console.log("Error during forgot password:", error);
      return {
        success: false,
        message: "An error occurred during password reset process",
      };
    }
  }

  async resetPassword(data: ResetPasswordData): Promise<ResetPasswordResponse> {
    try {
      console.log("Entering resetPassword in technician Service");
      const { email, password } = data;

      const technician = await this._technicianRepository.findByEmail(email);
      console.log("userData in resetPasssword:", technician);
      if (!technician.success || !technician.technicianData) {
        return {
          success: false,
          message: "technician not found with this email",
        };
      }

      const hashedPassword = await this._passwordService.hash(password);

      const updateResult = await this._technicianRepository.updatePassword(
        email,
        hashedPassword
      );

      if (!updateResult.success) {
        return {
          success: false,
          message: "Failed to update password",
        };
      }

      const redisKey = this.getOtpRedisKey(email, OtpPurpose.PASSWORD_RESET);
      await this._redisService.delete(redisKey);

      return {
        success: true,
        message: "Password reset successful",
      };
    } catch (error) {
      console.log("Error during password reset:", error);
      return {
        success: false,
        message: "An error occurred during password reset",
      };
    }
  }

  async login(data: LoginData): Promise<LoginResponse> {
    try {
      console.log("entering to the login credentials verifying in service");
      const { email, password } = data;
      const technician = await this._technicianRepository.findByEmail(email);
      console.log("technician", technician);
      if (!technician.success || !technician.technicianData) {
        return {
          success: false,
          message: "Technician not found",
        };
      }

      const isPasswordValid = await this._passwordService.verify(
        technician.technicianData.password,
        password
      );

      console.log("isPasswordValid:", isPasswordValid);

      if (!isPasswordValid) {
        return {
          success: false,
          message: "invalid password",
        };
      }

      if (technician.technicianData.status === "InActive") {
        return {
          success: false,
          message: "Your account has been blocked. Please contact support.",
        };
      }

      const technicianId = String(technician.technicianData._id);

      const access_token = this._jwtService.generateAccessToken(
        technicianId,
        Roles.TECHNICIAN
      );
      console.log("access_token:", access_token);
      const refresh_token = this._jwtService.generateRefreshToken(
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
        technician: technician.technicianData,
      };
    } catch (error) {
      console.log("error", error);
      return {
        success: false,
        message: "error occured during the login",
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
        const profilePhotoUrl = await this._fileUploader.uploadFile(
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
          const certificateUrl = await this._fileUploader.uploadFile(
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
        await this._technicianRepository.updateTechnicianQualification(
          technicianId,
          qualificationDataToSave
        );

      console.log("result from the technician service:", result);

      return {
        message: "Qualification submitted successfully",
        success: true,
        technician: result.technician,
      };
    } catch (error) {
      console.error("Error submitting technician qualification:", error);
      return {
        message: "Failed to submit qualification",
        success: false,
      };
    }
  }

  async getAllApplicants(options: { page?: number; limit?: number }): Promise<{
    success: boolean;
    message: string;
    data?: {
      applicants: ITechnician[];
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
      const result = await this._technicianRepository.getAllApplicants({
        page,
        limit,
      });

      console.log("result from the technician service:", result);

      return {
        success: true,
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

      const result = await this._technicianRepository.getTechnicianById(
        technicianId
      );

      if (!result.success || !result.technicianData) {
        return {
          message: result.message || "Technician not found",
          success: false,
        };
      }

      return {
        message: "Technician profile fetched successfully",
        success: true,
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
      };
    }
  }

  async verifyTechnician(
    technicianId: string
  ): Promise<VerifyTechnicianServiceResponse> {
    try {
      console.log("Verifying technician in service layer:", technicianId);

      const technicianResult =
        await this._technicianRepository.getTechnicianById(technicianId);

      if (!technicianResult.success || !technicianResult.technicianData) {
        return {
          success: false,
          message: "Technician not found",
        };
      }

      const technician = technicianResult.technicianData;

      const verificationResult =
        await this._technicianRepository.verifyTechnician(technicianId);

      if (!verificationResult.success) {
        return {
          success: false,
          message: verificationResult.message,
        };
      }

      try {
        const emailData = {
          technicianName: technician.username,
        };

        const emailContent = this._emailService.generateEmailContent(
          EmailType.VERIFICATION_SUCCESS,
          emailData
        );

        await this._emailService.sendEmail({
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
      };
    } catch (error) {
      console.log("Error during technician verification:", error);
      return {
        success: false,
        message: "An error occurred during technician verification",
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
        await this._technicianRepository.getTechnicianById(technicianId);

      if (!technicianResult.success || !technicianResult.technicianData) {
        return {
          success: false,
          message: "Technician not found",
        };
      }

      const technician = technicianResult.technicianData;

      const rejectionResult = await this._technicianRepository.rejectTechnician(
        technicianId
      );

      if (!rejectionResult.success) {
        return {
          success: false,
          message: rejectionResult.message,
        };
      }

      try {
        const emailData = {
          technicianName: technician.username,
          reason: reason || "Application did not meet our current requirements",
        };

        const emailContent = this._emailService.generateEmailContent(
          EmailType.APPLICATION_REJECTED,
          emailData
        );

        await this._emailService.sendEmail({
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
      };
    } catch (error) {
      console.log("Error during technician rejection:", error);
      return {
        success: false,
        message: "An error occurred during technician rejection",
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
    message: string;
    data?: {
      technicians: ITechnician[];
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
      const result = await this._technicianRepository.getAllTechnicians({
        page,
        limit,
        search: options.search,
        status: options.status,
        designation: options.designation,
      });

      console.log("result from the technician service:", result);

      return {
        success: true,
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
    message: string;
    data?: ITechnician[];
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

      if (!designationId || !userLongitude || !userLatitude) {
        return {
          success: false,
          message:
            "Missing required parameters: designationId, longitude, or latitude",
        };
      }

      const nearbyTechnicians =
        await this._technicianRepository.nearbyTechnicians(
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
      };
    }
  }

  async toggleTechnicianStatus(
    id: string
  ): Promise<ToggleTechnicianStatusResponse> {
    try {
      console.log("toogling hte technician status in the service layer:", id);
      const technicianResult =
        await this._technicianRepository.getTechnicianById(id);
      if (!technicianResult.success || !technicianResult.technicianData) {
        return {
          success: false,
          message: "TeChnician not found",
        };
      }
      const currentTechnician = technicianResult.technicianData;

      if (!currentTechnician.is_verified) {
        return {
          success: false,
          message: "Cannot toggle status of unverified technician",
        };
      }

      const newStatus =
        currentTechnician.status === "Active" ? "Blocked" : "Active";

      const toggleResult =
        await this._technicianRepository.toggleTechnicianStatus(id, newStatus);

      return {
        success: true,
        message: `Technician ${newStatus.toLowerCase()} successfully`,
        technician: toggleResult.technicianData,
      };
    } catch (error) {
      console.log("Error during technician status toggle:", error);
      return {
        success: false,
        message: "An error occurred while toggling technician status",
      };
    }
  }

  async getWalletBalance(techncianId: string): Promise<{
    success: boolean;
    message: string;
    data?: { balance: number };
  }> {
    try {
      console.log(
        "entering to the user service function which fetches the wallet balance for the user"
      );
      console.log(
        "userId in the user service function fetching the wallet balance:",
        techncianId
      );

      let fetchedWallet = await this._walletRepository.getWalletByOwnerId(
        techncianId,
        "technician"
      );

      console.log(`fetched wallet with the ${techncianId}:`, fetchedWallet);

      if (!fetchedWallet) {
        console.log(
          `Wallet not found for user ${techncianId}, creating new wallet`
        );
        try {
          fetchedWallet = await this._walletRepository.createWallet(
            techncianId,
            "user"
          );
          console.log(
            `Created new wallet for user ${techncianId}:`,
            fetchedWallet
          );
        } catch (createError) {
          console.log("Error creating wallet:", createError);
          return {
            success: false,
            message: "Failed to create wallet",
          };
        }
      }

      return {
        success: true,
        message: "Wallet balance fetched successfully",
        data: {
          balance: fetchedWallet.balance,
        },
      };
    } catch (error) {
      console.log(
        "error occured while fetching the user wallet balance:",
        error
      );
      return {
        success: false,
        message: "Internal Server Error",
      };
    }
  }

  async getAllWalletTransactions(options: {
    page?: number;
    limit?: number;
    technicianId: string;
  }): Promise<{
    success: boolean;
    message: string;
    data?: {
      transactions: IWalletTransaction[];
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
      console.log(
        "entered to the user service fetching all the wallet transactions for the user"
      );
      const page = options.page || 1;
      const limit = options.limit || 5;
      const userId = options.technicianId;

      const result =
        await this._walletTransactionRepository.getOwnerWalletTransactions({
          page,
          limit,
          ownerId: userId,
          ownerType: "technician",
        });

      console.log("fetched wallet transactions for the user:", result);
      return {
        success: true,
        message: "User transactions fetched successfully",
        data: {
          transactions: result.data,
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
      console.error("Error fetching user wallet transactions:", error);
      return {
        success: false,
        message: "Something went wrong while fetching user wallet transactions",
      };
    }
  }

  async getReviews(technicianId: string): Promise<{
    success: boolean;
    message: string;
    reviews?: IRating[];
    averageRating?: number;
    totalReviews?: number;
  }> {
    try {
      console.log("Fetching reviews for technician ID:", technicianId);

      if (!technicianId) {
        return {
          success: false,
          message: "Technician ID is required",
        };
      }

      const technicianResult =
        await this._technicianRepository.getTechnicianById(technicianId);
      if (!technicianResult.success || !technicianResult.technicianData) {
        return {
          success: false,
          message: "Technician not found",
        };
      }

      const reviewsResult =
        await this._ratingRepository.getRatingsByTechnicianId(technicianId);

      console.log(
        `Fetched ${reviewsResult.data.length} reviews for technician`
      );
      console.log(`Average rating: ${reviewsResult.averageRating}`);

      return {
        success: true,
        message: "Reviews fetched successfully",
        reviews: reviewsResult.data,
        averageRating: reviewsResult.averageRating,
        totalReviews: reviewsResult.total,
      };
    } catch (error) {
      console.error("Error fetching technician reviews:", error);
      return {
        success: false,
        message: "An error occurred while fetching reviews",
      };
    }
  }

  async getTechniciansWithSubscriptions(options: {
    page?: number;
    limit?: number;
    search?: string;
    filterPlan?: string;
  }): Promise<{
    success: boolean;
    message: string;
    data?: {
      technicians: ITechnician[];
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
      console.log(
        "entered to the technician service that fetches the technicians with subscription plans"
      );
      const page = options.page || 1;
      const limit = options.limit || 5;
      const result =
        await this._technicianRepository.getTechniciansWithSubscriptions({
          page,
          limit,
          search: options.search,
          filterPlan: options.filterPlan,
        });
      console.log("result from the technician service:", result);

      return {
        success: true,
        message: "Technicians subscription plan fetched successfully",
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
      console.log(
        "error occured while fetching the technicians with subscription plans",
        error
      );
      throw Error(
        "error occured while fetching the technicians with subscription plans"
      );
    }
  }
}
