import { Roles } from "../config/roles";
import { OtpPurpose, OTP_PREFIX } from "../config/otpConfig";
import {
  ForgotPasswordRequest,
  ForgotPasswordResponse,
  LoginData,
  LoginResponse,
  ResendOtpResponse,
  ResetPasswordData,
  ResetPasswordResponse,
  signupTechnicianResponse,
  SignupTechnicianData,
  TechnicianProfileResponse,
  TechnicianQualification,
  TechnicianQualificationSaveData,
  TechnicianQualificationUpdateResponse,
  ToggleTechnicianStatusResponse,
  VerifyOtpData,
  PaginatedTechnicianDto,
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
import { IWalletRepository } from "../interfaces/Irepositories/IwalletRepository";
import { IRatingRepository } from "../interfaces/Irepositories/IratingRepository";
import { IRating } from "../interfaces/Models/Irating";
import {
  CreateTechnician,
  INearbyTechnicianResponse,
} from "../interfaces/DTO/IRepository/ItechnicianRepository";
import { IBookingRepository } from "../interfaces/Irepositories/IbookingRespository";
import { IPaymentRepository } from "../interfaces/Irepositories/IpaymentRepository";
import { VerifyOtpResponse } from "../interfaces/DTO/IServices/IuserService";
import { INotificationService } from "../interfaces/Iservices/InotificationService";
import { IAdminRepository } from "../interfaces/Irepositories/IadminRepository";
import { IAddressService } from "../interfaces/Iservices/IaddressService";
import { IWalletService } from "../interfaces/Iservices/IwalletService";
import { ISubscriptionPlanService } from "../interfaces/Iservices/IsubscriptionPlanService";
import config from "../config/env";
import {
  AddAddressDto,
  OwnerAddressResponseDto,
} from "../interfaces/DTO/IServices/IaddressService";
import { formatDateForPeriod } from "../utils/dateHelpers";

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
    @inject("IRatingRepository") private _ratingRepository: IRatingRepository,
    @inject("IBookingRepository")
    private _bookingRepository: IBookingRepository,
    @inject("IPaymentRepository")
    private _paymentRepository: IPaymentRepository,
    @inject("INotificationService")
    private _notificationService: INotificationService,
    @inject("IAdminRepository") private _adminRepository: IAdminRepository,
    @inject("IAddressService") private _addressService: IAddressService,
    @inject("IWalletService") private _walletService: IWalletService,
    @inject("ISubscriptionPlanService")
    private _subscriptionPlanService: ISubscriptionPlanService
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

    await this._redisService.set(redisKey, otp, config.OTP_EXPIRY_SECONDS);

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
  ): Promise<signupTechnicianResponse> {
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
        return {
          message: "Technician already exists, Please login",
          success: false,
        };
      }

      const pendingTechnician = await this._redisService.getObject(
        `pending_technician:${email}`
      );
      if (pendingTechnician) {
        console.log("technician has pending signup, resending otp");

        const otp = await this.generateAndSendOtp(
          email,
          OtpPurpose.REGISTRATION
        );
        console.log("generated new otp for pending technician:", otp);

        await this._redisService.setObject(
          `pending_technician:${email}`,
          pendingTechnician,
          config.OTP_EXPIRY_SECONDS
        );

        return {
          message: "OTP sent to complete registration",
          success: true,
          data: { email },
        };
      }

      const hashedPassword = await this._passwordService.hash(password);
      const otp = await this.generateAndSendOtp(email, OtpPurpose.REGISTRATION);

      console.log("Generated otp for new technician registration:", otp);

      const technicianData = {
        ...data,
        password: hashedPassword,
      };

      await this._redisService.setObject(
        `pending_technician:${email}`,
        technicianData,
        config.OTP_EXPIRY_SECONDS
      );
      console.log("pending technician data stored in redis");

      return {
        message: "Registration successful!",
        success: true,
        data: { email },
      };
    } catch (error) {
      console.log("Error during technician signup:", error);
      throw new Error("An error occurred during the technician signup");
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
        const pendingTechnician =
          await this._redisService.getObject<CreateTechnician>(
            `pending_technician:${email}`
          );

        console.log(
          "pending technician found for registration verification:",
          pendingTechnician
        );

        if (!pendingTechnician) {
          return {
            success: false,
            message: "Registration expired or not found. Please signup again",
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

        const technicianData = {
          ...pendingTechnician,
          is_verified: false,
        };

        const newTechnician = await this._technicianRepository.createTechnician(
          technicianData
        );
        console.log("new technician created in MongoDB:", newTechnician);

        const otpRedisKey = this.getOtpRedisKey(email, OtpPurpose.REGISTRATION);
        await this._redisService.delete(otpRedisKey);
        await this._redisService.delete(`pending_technician:${email}`);

        return {
          message: "Email verified successfully! Please login to continue",
          success: true,
        };
      } else if (OtpPurpose.PASSWORD_RESET === purpose) {
        console.log("password resetting in the technician Service");

        const technician = await this._technicianRepository.findByEmail(email);
        console.log("technician found for password reset:", technician);

        if (!technician) {
          return {
            success: false,
            message: "Technician not found with this email",
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
        message: "An error occurred during the otp verification",
      };
    }
  }

  async resendOtp(data: string): Promise<ResendOtpResponse> {
    try {
      console.log("entering resendotp function in the technician service");

      const technician = await this._technicianRepository.findByEmail(data);

      if (technician) {
        console.log("technician found in MongoDB:", technician);

        if (!technician.is_verified) {
          return {
            success: false,
            message:
              "Your account is pending admin approval. Cannot reset password at this time.",
          };
        } else {
          const newOtp = await this.generateAndSendOtp(
            data,
            OtpPurpose.PASSWORD_RESET
          );
          console.log("generated new OTP for password reset:", newOtp);

          return {
            success: true,
            message: "OTP sent successfully for password reset",
            email: data,
          };
        }
      }

      const pendingTechnician =
        await this._redisService.getObject<CreateTechnician>(
          `pending_technician:${data}`
        );

      if (pendingTechnician) {
        console.log("pending technician found in Redis:", pendingTechnician);

        const newOtp = await this.generateAndSendOtp(
          data,
          OtpPurpose.REGISTRATION
        );
        console.log("generated new OTP for registration:", newOtp);

        await this._redisService.setObject(
          `pending_technician:${data}`,
          pendingTechnician,
          config.OTP_EXPIRY_SECONDS
        );

        return {
          success: true,
          message: "OTP sent successfully for registration",
          email: data,
        };
      }

      return {
        success: false,
        message: "Technician not found. Please signup first",
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
        about: qualificationData.about,
        status: "Pending" as const,
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

      const addressDto: AddAddressDto = {
        ownerId: technicianId,
        ownerModel: "technician",
        fullAddress: qualificationData.address,
        latitude: qualificationData.latitude,
        longitude: qualificationData.longitude,
        addressType: "Work",
      };

      const addressResult = await this._addressService.addAddress(addressDto);

      if (!addressResult.success) {
        console.log(
          "Failed to save technician address:",
          addressResult.message
        );
        return {
          success: false,
          message: `Qualification saved but address failed: ${addressResult.message}`,
        };
      }

      console.log("Address saved successfully for technician");

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
          yearsOfExperience: result.yearsOfExperience,
          Designation: result.Designation
            ? {
                designation: (
                  result.Designation as unknown as { designation: string }
                ).designation,
              }
            : undefined,
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
      technicians: PaginatedTechnicianDto[];
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

      const technicians: PaginatedTechnicianDto[] = result.data.map((tech) => ({
        _id: tech._id,
        username: tech.username,
        email: tech.email,
        phone: tech.phone,
        status: (tech.status as "Active" | "Blocked") || "Active",
        Designation: tech.Designation as unknown as {
          _id: string;
          designation: string;
        },
      }));

      return {
        success: true,
        message: "Technicians fetched successfully",
        data: {
          technicians,
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

  async getTechnicianDetails(
    technicianId: string
  ): Promise<TechnicianProfileResponse> {
    try {
      console.log(
        "entered the function inside the get technician details:",
        technicianId
      );

      const result = await this._technicianRepository.getTechnicianById(
        technicianId
      );

      let addresses: OwnerAddressResponseDto[] = [];

      try {
        const addressResponse = await this._addressService.getOwnerAddresses(
          technicianId,
          "technician"
        );

        if (addressResponse.success && addressResponse.data) {
          addresses = addressResponse.data;
        }
      } catch (addressError) {
        console.error("Error fetching technician addresses:", addressError);
      }

      const reviewsResult =
        await this._ratingRepository.getRatingsByTechnicianId(technicianId);

      const walletBalance = await this._walletService.getWalletBalance(
        technicianId,
        "technician"
      );

      const currentSubscription =
        await this._subscriptionPlanService.getTechnicianActiveSubscriptionPlan(
          technicianId
        );

      if (!currentSubscription.data) {
        return {
          success: false,
          message: "Technician dont have the subscription plan",
        };
      }

      return {
        message: "successfully fetched the techncian details",
        success: true,
        technician: {
          username: result?.username,
          email: result?.email,
          phone: result?.phone,
          yearsOfExperience: result?.yearsOfExperience,
          Designation: result?.Designation
            ? {
                designation: (
                  result.Designation as unknown as { designation: string }
                ).designation,
              }
            : undefined,
          About: result?.About,
          image: result?.image,
          certificates: result?.certificates,
          addresses: addresses,
          currentSubscription: {
            planName: currentSubscription.data?.currentSubscription.planName,
            status: currentSubscription.data.currentSubscription.status,
            commissionRate:
              currentSubscription.data.currentSubscription.commissionRate,
            walletCreditDelay:
              currentSubscription.data.currentSubscription.walletCreditDelay,
            profileBoost:
              currentSubscription.data.currentSubscription.profileBoost,
            durationInMonths:
              currentSubscription.data.currentSubscription.durationInMonths,
            expiresAt: currentSubscription.data.currentSubscription.expiresAt,
            amount: currentSubscription.data.currentSubscription.amount,
          },
          reviews: reviewsResult.data,
          averageRating: reviewsResult.averageRating,
          totalReviews: reviewsResult.total,
          walletBalance: walletBalance.data?.balance,
        },
      };
    } catch (error) {
      console.error("Error fetching technician details:", error);
      return {
        success: false,
        message: "Something went wrong while fetching technician details",
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
    technicianId: string
  ): Promise<ToggleTechnicianStatusResponse> {
    try {
      console.log(
        "toogling hte technician status in the service layer:",
        technicianId
      );
      const technician = await this._technicianRepository.getTechnicianById(
        technicianId
      );
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
        await this._technicianRepository.toggleTechnicianStatus(
          technicianId,
          newStatus
        );

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
      console.log("Fetching dashboard stats for technician:", technicianId);

      const [totalEarnings, completedJobs, averageRating, pendingJobs] =
        await Promise.all([
          this._walletRepository.getTechncianTotalEarnings(technicianId),
          this._bookingRepository.getTechnicianTotalCompletedBookings(
            technicianId
          ),
          this._ratingRepository.getRatingsByTechnicianId(technicianId),
          this._bookingRepository.getTechnicianPendingJobs(technicianId),
        ]);

      return {
        success: true,
        message: "Fetched technician dashboard stats successfully",
        data: {
          totalEarnings,
          completedJobs,
          averageRating: averageRating.averageRating,
          pendingJobs,
        },
      };
    } catch (error) {
      console.log("Error fetching technician dashboard stats:", error);
      return {
        success: false,
        message: "Failed to fetch technician dashboard stats",
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
        date: formatDateForPeriod(item.date, period),
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
