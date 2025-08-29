import { Roles } from "../config/roles";
import {
  OtpPurpose,
  OTP_EXPIRY_SECONDS,
  OTP_PREFIX,
} from "../config/otpConfig";
import {
  ForgotPasswordRequest,
  ForgotPasswordResponse,
  LoginData,
  LoginResponse,
  ResendOtpResponse,
  ResetPasswordData,
  ResetPasswordResponse,
  signupResponse,
  SignupTechnicianData,
  TechnicianProfileResponse,
  TechnicianQualification,
  TechnicianQualificationSaveData,
  TechnicianQualificationUpdateResponse,
  ToggleTechnicianStatusResponse,
  VerifyOtpData,
  ApproveTechnicianResponse,
  RejectTechnicianResponse,
} from "../interfaces/DTO/IServices/ItechnicianService";
import { ITechnicianRepository } from "../interfaces/Irepositories/ItechnicianRepository";
import { ITechnicianService } from "../interfaces/Iservices/ItechnicianService";
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
import { ISubscriptionPlanHistoryRepository } from "../interfaces/Irepositories/IsubscriptionPlanHistoryRepository";
import { ISubscriptionPlanRepository } from "../interfaces/Irepositories/IsubscriptionPlanRepository";
import { INearbyTechnicianResponse } from "../interfaces/DTO/IRepository/ItechnicianRepository";
import { IBookingRepository } from "../interfaces/Irepositories/IbookingRespository";
import { IPaymentRepository } from "../interfaces/Irepositories/IpaymentRepository";
import { VerifyOtpResponse } from "../interfaces/DTO/IServices/IuserService";
import { ISubscriptionPlan } from "../interfaces/Models/IsubscriptionPlan";
import { INotificationService } from "../interfaces/Iservices/InotificationService";
import { IAdminRepository } from "../interfaces/Irepositories/IadminRepository";

@injectable()
export class TechnicianService implements ITechnicianService {
  constructor(
    @inject("ITechnicianRepository")
    private _technicianRepository: ITechnicianRepository,
    @inject("IEmailService") private _emailService: IEmailService,
    @inject("IOTPService") private _otpService: IOTPService,
    @inject("IPasswordHasher") private _passwordService: IPasswordHasher,
    @inject("IJwtService") private _jwtService: IJwtService,
    @inject("IRedisService") private _redisService: IRedisService,
    @inject("IFileUploader") private _fileUploader: IFileUploader,
    @inject("IWalletRepository") private _walletRepository: IWalletRepository,
    @inject("IWalletTransactionRepository")
    private _walletTransactionRepository: IWalletTransactionRepository,
    @inject("IRatingRepository") private _ratingRepository: IRatingRepository,
    @inject("ISubscriptionPlanHistoryRepository")
    private _subscriptionPlanHistoryRepository: ISubscriptionPlanHistoryRepository,
    @inject("ISubscriptionPlanRepository")
    private _subsciptionPlanRepository: ISubscriptionPlanRepository,
    @inject("IBookingRepository")
    private _bookingRepository: IBookingRepository,
    @inject("IPaymentRepository")
    private _paymentRepository: IPaymentRepository,
    @inject("INotificationService")
    private _notificationService: INotificationService,
    @inject("IAdminRepository") private _adminRepository: IAdminRepository
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

  async technicianSignUp(data: SignupTechnicianData): Promise<signupResponse> {
    try {
      console.log(
        "entering to the techniciansignup function in the technician service"
      );
      console.log("data:", data);
      const { email, password } = data;

      const existingTechnician = await this._technicianRepository.findByEmail(
        email
      );

      if (existingTechnician) {
        if (existingTechnician.is_verified && existingTechnician.is_verified) {
          return {
            message: "Technician already exists, Please login",
            success: false,
          };
        } else if (!existingTechnician.email_verified) {
          const otp = await this.generateAndSendOtp(
            email,
            OtpPurpose.REGISTRATION
          );
          console.log("Resent OTP for existing unverified technician:", otp);
          const newExpiresAt = new Date(Date.now() + 15 * 60 * 1000);
          await this._technicianRepository.updateTechnicianExpiry(
            email,
            newExpiresAt
          );
          return {
            message: "OTP sent to complete email verification",
            email,
            success: true,
          };
        } else {
          return {
            message:
              "Email verified. Application submitted and waiting for admin approval.",
            success: false,
          };
        }
      }

      const hashedPassword = await this._passwordService.hash(password);
      const otp = await this.generateAndSendOtp(email, OtpPurpose.REGISTRATION);

      console.log("Generated OTP for new technician registration:", otp);

      const newExpiresAt = new Date(Date.now() + 15 * 60 * 1000);

      const technicianData = {
        ...data,
        password: hashedPassword,
        expiresAt: newExpiresAt,
      };

      const newTechnician = await this._technicianRepository.createTechnician(
        technicianData
      );
      console.log("New technician created:", newTechnician);

      return {
        message:
          "OTP sent to your email. Please verify to submit your application.",
        email,
        success: true,
      };
    } catch (error) {
      console.log("Error during technician signup:", error);
      throw new Error("An error occured during the technician signup");
    }
  }

  async verifyOtp(data: VerifyOtpData): Promise<VerifyOtpResponse> {
    try {
      console.log("entering to the verifyotp function in technicianService");

      const { otp, email, purpose } = data;

      console.log("otp:", otp);
      console.log("email:", email);
      console.log("purpose:", purpose);

      if (OtpPurpose.REGISTRATION === purpose) {
        const technician = await this._technicianRepository.findByEmail(email);

        console.log(
          "technician found for registration verification:",
          technician
        );

        if (!technician) {
          return {
            success: false,
            message: "Technician not found or registration expired",
          };
        }

        if (technician.email_verified) {
          return {
            success: false,
            message: "Email already verified. Waiting for admin approval.",
          };
        }

        const verificationResult = await this.verifyOtpGeneric(
          email,
          otp,
          OtpPurpose.REGISTRATION
        );

        if (!verificationResult.success) {
          return {
            success: false,
            message: verificationResult.message,
          };
        }

        await this._technicianRepository.updateTechnicianEmailVerification(
          email
        );
        console.log("Technician email verified successfully");

        const redisKey = this.getOtpRedisKey(email, OtpPurpose.REGISTRATION);
        await this._redisService.delete(redisKey);

        return {
          message: "Email verified successfully! Please login to continue",
          success: true,
        };
      } else if (OtpPurpose.PASSWORD_RESET === purpose) {
        console.log("password resetting in the technican Service");

        const technician = await this._technicianRepository.findByEmail(email);

        console.log("technician found for password reset:", technician);

        if (!technician) {
          return {
            success: false,
            message: "Technician not found with this email",
          };
        }

        if (!technician.email_verified) {
          return {
            success: false,
            message: "Please verify your email first",
          };
        }

        if (!technician.is_verified) {
          return {
            success: false,
            message: "Your account is pending admin approval",
          };
        }

        const verificationResult = await this.verifyOtpGeneric(
          email,
          otp,
          OtpPurpose.PASSWORD_RESET
        );

        return {
          success: verificationResult.success,
          message: verificationResult.message,
        };
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

      const technician = await this._technicianRepository.findByEmail(data);
      console.log(
        "technician in the resendOtp in the technician service:",
        technician
      );

      if (!technician) {
        return {
          success: false,
          message: "Technician not found",
        };
      }

      let purpose: OtpPurpose;
      let message: string;

      if (!technician.email_verified) {
        purpose = OtpPurpose.REGISTRATION;
        message = "OTP sent successfully for email verification";

        const newExpiresAt = new Date(Date.now() + 15 * 60 * 1000);
        await this._technicianRepository.updateTechnicianExpiry(
          data,
          newExpiresAt
        );
      } else if (technician.email_verified && !technician.is_verified) {
        return {
          success: false,
          message:
            "Your account is pending admin approval. Cannot reset password at this time.",
        };
      } else if (technician.email_verified && technician.is_verified) {
        purpose = OtpPurpose.PASSWORD_RESET;
        message = "OTP sent successfully for password reset";
      } else {
        return {
          success: false,
          message: "Invalid account state",
        };
      }

      const newOtp = await this.generateAndSendOtp(data, purpose);
      console.log("generated new Otp:", newOtp);

      return {
        success: true,
        message,
        email: data,
      };
    } catch (error) {
      console.log("error occurred while resending the otp", error);
      return {
        success: false,
        message: "Error occurred while resending the otp",
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

      if (!technician) {
        return {
          success: false,
          message: "Technician not found with this email",
        };
      }

      if (!technician.email_verified) {
        return {
          success: false,
          message: "Please verify your email before resetting password",
        };
      }

      if (!technician.is_verified) {
        return {
          success: false,
          message:
            "Your account is pending admin approval. Cannot reset password at this time.",
        };
      }

      if (technician.status !== "Active") {
        return {
          success: false,
          message: "Your account has been blocked. Please contact support.",
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
      console.log("technician data in resetPassword:", technician);

      if (!technician) {
        return {
          success: false,
          message: "Technician not found with this email",
        };
      }

      if (!technician.email_verified) {
        return {
          success: false,
          message: "Please verify your email first",
        };
      }

      if (!technician.is_verified) {
        return {
          success: false,
          message: "Your account is pending admin approval",
        };
      }

      if (technician.status !== "Active") {
        return {
          success: false,
          message: "Your account has been blocked. Please contact support.",
        };
      }

      const hashedPassword = await this._passwordService.hash(password);

      await this._technicianRepository.updatePassword(email, hashedPassword);

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

      if (!technician) {
        return {
          success: false,
          message: "Technician not found",
        };
      }

      if (!technician.email_verified) {
        return {
          success: false,
          message: "Please verify your email before logging in",
        };
      }

      if (technician.status === "Blocked") {
        return {
          success: false,
          message: "Your account has been blocked. Please contact support.",
        };
      }

      const isPasswordValid = await this._passwordService.verify(
        technician.password,
        password
      );

      console.log("isPasswordValid:", isPasswordValid);

      if (!isPasswordValid) {
        return {
          success: false,
          message: "Invalid password",
        };
      }

      const technicianId = String(technician._id);

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
        data: {
          _id: technician._id,
          username: technician.username,
          email: technician.email,
          phone: technician.phone,
          email_verified: technician.email_verified,
          status: technician.status,
          image: technician.image,
          is_verified: technician.is_verified,
        },
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

      const qualificationDataToSave: TechnicianQualificationSaveData = {
        experience: qualificationData.experience,
        designation: qualificationData.designation,
        longitude: qualificationData.longitude,
        latitude: qualificationData.latitude,
        address: qualificationData.address,
        about: qualificationData.about,
        status: "Pending" as const,
        is_verified: false,
      };

      if (qualificationData.profilePhoto) {
        const profilePhotoUrl = await this._fileUploader.uploadFile(
          qualificationData.profilePhoto.path,
          { folder: "technicians/profile" }
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
            { folder: "technicians/certificates" }
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

      const admin = await this._adminRepository.getAdmin();

      if (!admin) {
        return {
          success: false,
          message: "admin not found",
        };
      }

      try {
        await this._notificationService.createNotification({
          recipientId: admin._id.toString(),
          recipientType: "admin",
          title: "New Application",
          message: "New technician application submitted for review",
          type: "application_submitted",
        });
      } catch (error) {
        console.log("error occured while creating the notification:", error);
      }

      return {
        message: "Qualification submitted successfully",
        success: true,
        technician: result.technician,
        adminId: admin._id.toString(),
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
      const page = options.page;
      const limit = options.limit;
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
            limit: result.limit,
            hasNextPage: result.page < result.pages,
            hasPrevPage: result.page > 1,
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

      console.log(
        "result in the get technician by ID function in the technician service:",
        result
      );

      if (!result) {
        return {
          message: "Technician not found",
          success: false,
        };
      }

      return {
        message: "Technician profile fetched successfully",
        success: true,
        technician: {
          username: result.username,
          email: result.email,
          phone: result.phone,
          is_verified: result.is_verified,
          email_verified: result.email_verified,
          yearsOfExperience: result.yearsOfExperience,
          Designation: result.Designation
            ? {
                designation: (
                  result.Designation as unknown as { designation: string }
                ).designation,
              }
            : undefined,
          address: result.address,
          About: result.About,
          image: result.image,
          certificates: result.certificates,
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
  ): Promise<ApproveTechnicianResponse> {
    try {
      console.log("Verifying technician in service layer:", technicianId);

      const technician = await this._technicianRepository.getTechnicianById(
        technicianId
      );
      if (!technician) {
        return { success: false, message: "Technician not found" };
      }

      const subscriptionPlan =
        await this._subsciptionPlanRepository.findByPlanName("Basic");
      if (!subscriptionPlan) {
        return { success: false, message: "Basic subscription plan not found" };
      }

      const subscriptionHistoryData = {
        technicianId: technician._id.toString(),
        subscriptionPlanId: subscriptionPlan._id.toString(),
        amount: 0,
        status: "Active" as const,
      };

      const [subscriptionHistory, newWallet] = await Promise.all([
        this._subscriptionPlanHistoryRepository.createHistory(
          subscriptionHistoryData
        ),
        this._walletRepository.createWallet(
          technician._id.toString(),
          "technician"
        ),
      ]);

      if (!subscriptionHistory || !newWallet) {
        return {
          success: false,
          message: "Failed to setup technician resources. Please try again.",
        };
      }

      const verificationResult =
        await this._technicianRepository.verifyTechnician(technicianId);
      if (!verificationResult.success) {
        return { success: false, message: verificationResult.message };
      }

      let emailSent = false;
      try {
        await this._emailService.sendTechnicianApprovalEmail(
          technician.email,
          technician.username
        );
        emailSent = true;
        console.log("Verification success email sent to:", technician.email);
      } catch (emailError) {
        console.log("Error sending verification email:", emailError);
      }

      return {
        success: true,
        message: emailSent
          ? "Technician verified successfully and notification email sent"
          : "Technician verified successfully but email notification failed",
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
  ): Promise<RejectTechnicianResponse> {
    try {
      console.log("Rejecting technician in service layer:", technicianId);

      const technician = await this._technicianRepository.getTechnicianById(
        technicianId
      );
      if (!technician) {
        return { success: false, message: "Technician not found" };
      }

      const rejectionResult = await this._technicianRepository.rejectTechnician(
        technicianId
      );
      if (!rejectionResult.success) {
        return { success: false, message: rejectionResult.message };
      }

      let emailSent = false;
      try {
        await this._emailService.sendTechnicianRejectionEmail(
          technician.email,
          technician.username,
          reason || "Application did not meet our current requirements"
        );
        emailSent = true;
        console.log("Rejection email sent to:", technician.email);
      } catch (emailError) {
        console.log("Error sending rejection email:", emailError);
      }

      return {
        success: true,
        message: emailSent
          ? "Technician application rejected successfully and notification email sent"
          : "Technician application rejected successfully but email notification failed",
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
      console.log(
        "options in the fetching etchncians in techncian service:",
        options
      );
      const page = options.page;
      const limit = options.limit;
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
            limit: result.limit,
            hasNextPage: result.page < result.pages,
            hasPrevPage: result.page > 1,
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
    data?: INearbyTechnicianResponse[];
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
      const technician = await this._technicianRepository.getTechnicianById(id);
      if (!technician) {
        return {
          success: false,
          message: "TeChnician not found",
        };
      }

      if (!technician.is_verified) {
        return {
          success: false,
          message: "Cannot toggle status of unverified technician",
        };
      }

      const newStatus = technician.status === "Active" ? "Blocked" : "Active";

      const toggleResult =
        await this._technicianRepository.toggleTechnicianStatus(id, newStatus);

      return {
        success: true,
        message: `Technician ${newStatus.toLowerCase()} successfully`,
        data: {
          technicianId: toggleResult._id,
          status: toggleResult.status,
        },
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

      const technician = await this._technicianRepository.getTechnicianById(
        technicianId
      );
      if (!technician) {
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

  async getTechnicianActiveSubscriptionPlan(technicianId: string): Promise<{
    success: boolean;
    message: string;
    data?: {
      currentSubscription: {
        planName: string;
        status: string;
        commissionRate: number;
        walletCreditDelay: number;
        profileBoost: boolean;
        durationInMonths: number;
        expiresAt?: string;
        amount: number;
      };
      upcomingSubscription?: {
        planName: string;
        commissionRate: number;
        walletCreditDelay: number;
        profileBoost: boolean;
        durationInMonths: number;
        amount: number;
        activatesOn?: string;
      } | null;
    };
  }> {
    try {
      console.log("Service: Getting technician active subscription plan");

      const technician = await this._technicianRepository.getTechnicianById(
        technicianId
      );

      if (!technician) {
        return {
          success: false,
          message: "Technician not found",
        };
      }

      const activeSubscription =
        await this._subscriptionPlanHistoryRepository.findActiveSubscriptionByTechnicianId(
          technicianId
        );

      console.log(
        "fetched active subscription plan in the technician service:",
        activeSubscription
      );

      if (!activeSubscription) {
        return {
          success: false,
          message: "No active subscription found",
        };
      }

      const subscriptionPlan =
        await this._subsciptionPlanRepository.findSubscriptionPlanById(
          activeSubscription.subscriptionPlanId.toString()
        );

      if (!subscriptionPlan) {
        return {
          success: false,
          message: "Subscription plan not found",
        };
      }

      let status = "Active";
      if (activeSubscription.expiryDate) {
        const isStillActive =
          new Date() <= new Date(activeSubscription.expiryDate);
        status = isStillActive ? "Active" : "Expired";
      }

      let upcomingSubscription = null;
      if (
        activeSubscription.hasNextUpgrade &&
        activeSubscription.nextUpgrade?.planId
      ) {
        const upcomingPlan = activeSubscription.nextUpgrade
          .planId as ISubscriptionPlan;

        upcomingSubscription = {
          planName: upcomingPlan.planName,
          commissionRate: upcomingPlan.commissionRate,
          walletCreditDelay: upcomingPlan.WalletCreditDelay,
          profileBoost: upcomingPlan.profileBoost,
          durationInMonths: upcomingPlan.durationInMonths || 0,
          amount: activeSubscription.nextUpgrade.amount,
          activatesOn: activeSubscription.expiryDate
            ? activeSubscription.expiryDate.toISOString()
            : undefined,
        };
      }

      return {
        success: true,
        message: "Active subscription plan fetched successfully",
        data: {
          currentSubscription: {
            planName: subscriptionPlan.planName,
            status: status,
            commissionRate: subscriptionPlan.commissionRate,
            walletCreditDelay: subscriptionPlan.WalletCreditDelay,
            profileBoost: subscriptionPlan.profileBoost,
            durationInMonths: subscriptionPlan.durationInMonths || 0,
            expiresAt: activeSubscription.expiryDate
              ? activeSubscription.expiryDate.toISOString()
              : undefined,
            amount: activeSubscription.amount,
          },
          upcomingSubscription: upcomingSubscription,
        },
      };
    } catch (error) {
      console.log("Error in service getting subscription plan:", error);
      return {
        success: false,
        message: "Error occurred while fetching subscription plan",
      };
    }
  }

  async countActiveTechnicians(): Promise<number> {
    try {
      console.log(
        "entered the function that fetches the total number of active technicians in technciian service"
      );
      const activeTechncians =
        await this._technicianRepository.countActiveTechnicians();
      console.log(
        "active technicians from the technician repository:",
        activeTechncians
      );
      return activeTechncians;
    } catch (error) {
      console.log(
        "error occured while fetching the active technicians:",
        error
      );
      return 0;
    }
  }

  async getDashboardStats(technicianId: string): Promise<{
    success: boolean;
    message: string;
    data?: {
      totalEarnings: number;
      completedJobs: number;
      averageRating: number;
      pendingJobs: number;
    };
  }> {
    try {
      console.log(
        "entering to the technician service that fetches the dashbaord stats for the technicians"
      );
      console.log("technicianId in the dashboard stats:", technicianId);
      const totalEarnings =
        await this._walletRepository.getTechncianTotalEarnings(technicianId);
      console.log("totalearnings earned by the technician:", totalEarnings);
      const completedJobs =
        await this._bookingRepository.getTechnicianTotalCompletedBookings(
          technicianId
        );
      console.log("total completed jobs by the technician:", completedJobs);
      const averageRating =
        await this._ratingRepository.getRatingsByTechnicianId(technicianId);
      console.log("averageratings by the technician:", averageRating);
      const pendingJobs =
        await this._bookingRepository.getTechnicianPendingJobs(technicianId);
      console.log("pending jobs for the technician:", pendingJobs);

      return {
        success: true,
        message: "fetched the technician dashbaord stats successfully",
        data: {
          totalEarnings,
          completedJobs,
          averageRating: averageRating.averageRating,
          pendingJobs,
        },
      };
    } catch (error) {
      console.log(
        "error occured while fetching the technician dashbaord stats:",
        error
      );
      return {
        success: false,
        message: "failed to fetch the technician dashboard stats",
      };
    }
  }

  async getTechnicianEarningsData(
    technicianId: string,
    period: "daily" | "weekly" | "monthly" | "yearly",
    startDate?: string,
    endDate?: string
  ): Promise<{
    success: boolean;
    message: string;
    data?: Array<{
      date: string;
      earnings: number;
      jobs: number;
      avgPerJob: number;
      period: string;
    }>;
    summary?: {
      totalEarnings: number;
      totalJobs: number;
      avgEarningsPerPeriod: number;
      period: string;
    };
  }> {
    try {
      const start = startDate ? new Date(startDate) : undefined;
      const end = endDate ? new Date(endDate) : undefined;

      const earningsData = await this._paymentRepository.getTechnicianEarnings(
        technicianId,
        period,
        start,
        end
      );

      const formattedData = earningsData.map((item) => ({
        date: this.formatDateForPeriod(item.date, period),
        earnings: item.totalEarnings,
        jobs: item.jobsCompleted,
        avgPerJob: item.avgEarningsPerJob,
        period: period,
      }));

      const totalEarnings = earningsData.reduce(
        (sum, item) => sum + item.totalEarnings,
        0
      );
      const totalJobs = earningsData.reduce(
        (sum, item) => sum + item.jobsCompleted,
        0
      );

      return {
        success: true,
        message: `${period} earnings data fetched successfully`,
        data: formattedData,
        summary: {
          totalEarnings: Math.round(totalEarnings * 100) / 100,
          totalJobs,
          avgEarningsPerPeriod:
            formattedData.length > 0
              ? Math.round((totalEarnings / formattedData.length) * 100) / 100
              : 0,
          period,
        },
      };
    } catch (error) {
      console.log("Error in getTechnicianEarningsData:", error);
      return {
        success: false,
        message: "Failed to fetch technician earnings data",
      };
    }
  }

  private formatDateForPeriod(date: Date | string, period: string): string {
    let d: Date;

    if (typeof date === "string") {
      d = new Date(date);
    } else {
      d = date;
    }

    switch (period) {
      case "daily":
        return d.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        });
      case "weekly":
        return `Week ${this.getWeekNumber(d)}`;
      case "monthly":
        return d.toLocaleDateString("en-US", {
          month: "short",
          year: "numeric",
        });
      case "yearly":
        return d.getFullYear().toString();
      default:
        return d.toLocaleDateString();
    }
  }

  private getWeekNumber(date: Date): number {
    const d = new Date(
      Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
    );
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  }

  async getTechnicianServiceCategoriesData(
    technicianId: string,
    startDate?: string,
    endDate?: string
  ): Promise<{
    success: boolean;
    message: string;
    data?: Array<{
      categoryId: string;
      categoryName: string;
      revenue: number;
      jobsCount: number;
      percentage: number;
    }>;
    totalRevenue?: number;
  }> {
    try {
      const start = startDate ? new Date(startDate) : undefined;
      const end = endDate ? new Date(endDate) : undefined;

      const categoriesData =
        await this._paymentRepository.getTechnicianServiceCategoriesRevenue(
          technicianId,
          start,
          end
        );

      const totalRevenue = categoriesData.reduce(
        (sum, item) => sum + item.revenue,
        0
      );

      const formattedData = categoriesData.map((item) => ({
        categoryId: item.categoryId,
        categoryName: item.categoryName,
        revenue: item.revenue,
        jobsCount: item.jobsCount,
        percentage:
          totalRevenue > 0
            ? Math.round((item.revenue / totalRevenue) * 100)
            : 0,
      }));

      return {
        success: true,
        message: "Service categories data fetched successfully",
        data: formattedData,
        totalRevenue: Math.round(totalRevenue * 100) / 100,
      };
    } catch (error) {
      console.log("Error in getTechnicianServiceCategoriesData:", error);
      return {
        success: false,
        message: "Failed to fetch service categories data",
      };
    }
  }

  async getTechnicianBookingStatusData(
    technicianId: string,
    startDate?: string,
    endDate?: string
  ): Promise<{
    success: boolean;
    message: string;
    data?: Array<{
      status: string;
      count: number;
      percentage: number;
    }>;
    totalBookings?: number;
  }> {
    try {
      const start = startDate ? new Date(startDate) : undefined;
      const end = endDate ? new Date(endDate) : undefined;

      const statusData =
        await this._bookingRepository.getTechnicianBookingStatusDistribution(
          technicianId,
          start,
          end
        );

      const totalBookings = statusData.reduce(
        (sum, item) => sum + item.count,
        0
      );

      const formattedData = statusData.map((item) => ({
        status: item.status,
        count: item.count,
        percentage:
          totalBookings > 0
            ? Math.round((item.count / totalBookings) * 100)
            : 0,
      }));

      return {
        success: true,
        message: "Booking status data fetched successfully",
        data: formattedData,
        totalBookings,
      };
    } catch (error) {
      console.log("Error in getTechnicianBookingStatusData:", error);
      return {
        success: false,
        message: "Failed to fetch booking status data",
      };
    }
  }
}
