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
  SignupUserData,
  tempUserResponse,
  verifyOtpData,
  ToggleUserStatusResponse,
  UserProfileResponse,
  EditProfileResponse,
  UserProfileUpdateData,
  AddMoneyResponse,
} from "../interfaces/DTO/IServices/IuserService";
import { ItempUserRepository } from "../interfaces/Irepositories/ItempUserRepository";
import { IuserRepository } from "../interfaces/Irepositories/IuserRepository";
import { IuserService } from "../interfaces/Iservices/IuserService";
import { ItempUser } from "../interfaces/Models/ItempUser";
import { IemailService } from "../interfaces/Iemail/Iemail";
import { HTTP_STATUS } from "../utils/httpStatus";
import { IjwtService } from "../interfaces/Ijwt/Ijwt";
import { IOTPService } from "../interfaces/Iotp/IOTP";
import { IPasswordHasher } from "../interfaces/IpasswordHasher/IpasswordHasher";
import { IredisService } from "../interfaces/Iredis/Iredis";
import { OtpVerificationResult } from "../interfaces/Iotp/IOTP";
import { inject, injectable } from "tsyringe";
import { Iuser } from "../interfaces/Models/Iuser";
import { IFileUploader } from "../interfaces/IfileUploader/IfileUploader";
import { IWalletRepository } from "../interfaces/Irepositories/IwalletRepository";
import { IWalletTransactionRepository } from "../interfaces/Irepositories/IwalletTransactionRepository";
import { IWallet } from "../interfaces/Models/Iwallet";
import { stripe } from "../config/stripeConfig";
import config from "../config/env";
import { IWalletTransaction } from "../interfaces/Models/IwalletTransaction";

@injectable()
export class UserService implements IuserService {
  constructor(
    @inject("IuserRepository") private userRepository: IuserRepository,
    @inject("ItempUserRepository")
    private tempUserRepository: ItempUserRepository,
    @inject("IemailService") private emailService: IemailService,
    @inject("IOTPService") private otpService: IOTPService,
    @inject("IPasswordHasher") private passwordService: IPasswordHasher,
    @inject("IjwtService") private jwtService: IjwtService,
    @inject("IredisService") private redisService: IredisService,
    @inject("IFileUploader") private fileUploader: IFileUploader,
    @inject("IWalletRepository") private walletRepository: IWalletRepository,
    @inject("IWalletTransactionRepository")
    private walletTransactionRepository: IWalletTransactionRepository
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

  async userSignUp(data: SignupUserData): Promise<tempUserResponse> {
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

  async verifyOtp(data: verifyOtpData): Promise<RegisterResponse> {
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

        const newWallet = await this.walletRepository.createWallet(
          newUser._id.toString()
        );

        console.log("newly created wallet:", newWallet);

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

  async resendOtp(data: string): Promise<ResendOtpResponse> {
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
    data: ForgotPasswordRequest
  ): Promise<ForgotPasswordResponse> {
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

  async resetPassword(data: ResetPasswordData): Promise<ResetPasswordResponse> {
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

  async login(data: loginData): Promise<loginResponse> {
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

      if (!user.userData.status) {
        return {
          success: false,
          message: "Your account has been blocked. Please contact support.",
          status: HTTP_STATUS.BAD_REQUEST,
        };
      }

      const userId = String(user.userData._id);
      console.log("userId from login:", userId);
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
          image: user.userData.image,
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

  async getAllUsers(options: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
  }): Promise<{
    success: boolean;
    status: number;
    message: string;
    data?: {
      users: Iuser[];
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
      console.log("Function fetching all the users");
      const page = options.page || 1;
      const limit = options.limit || 5;
      const result = await this.userRepository.getAllUsers({
        page,
        limit,
        search: options.search,
        status: options.status,
      });

      console.log("result from the user service:", result);

      return {
        success: true,
        status: HTTP_STATUS.OK,
        message: "Users fetched successfully",
        data: {
          users: result.data,
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
      console.error("Error fetching users:", error);
      return {
        success: false,
        status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
        message: "Something went wrong while fetching users",
      };
    }
  }

  async toggleUserStatus(id: string): Promise<ToggleUserStatusResponse> {
    try {
      const user = await this.userRepository.findById(id);
      console.log("User fetched from repository:", user);

      if (!user) {
        return {
          message: "User not found",
        };
      }

      const newStatus = !user.status;
      let response = await this.userRepository.blockUser(id, newStatus);
      console.log(
        "Response after toggling user status from the user repository:",
        response
      );

      return {
        message: `User successfully ${newStatus ? "unblocked" : "blocked"}`,
        user: { ...user.toObject(), status: newStatus },
      };
    } catch (error) {
      console.error("Error toggling user status:", error);
      return {
        message: "Failed to toggle user status",
      };
    }
  }

  async getUserProfile(userId: string): Promise<UserProfileResponse> {
    try {
      console.log("Fetching user profile in user service for ID:", userId);

      const userData = await this.userRepository.findById(userId);

      if (!userData) {
        return {
          message: "User not found",
          success: false,
          status: HTTP_STATUS.NOT_FOUND,
        };
      }

      return {
        message: "User profile fetched successfully",
        success: true,
        status: HTTP_STATUS.OK,
        user: userData,
      };
    } catch (error) {
      console.error("Error fetching user profile:", error);
      return {
        message: "Failed to fetch user profile",
        success: false,
        status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
      };
    }
  }

  async editProfile(
    userId: string,
    updateData: UserProfileUpdateData
  ): Promise<EditProfileResponse> {
    try {
      console.log("Entering editProfile in user service");
      console.log("userId:", userId, "updateData:", updateData);

      const existingUser = await this.userRepository.findById(userId);
      if (!existingUser) {
        return {
          success: false,
          message: "User not found",
          status: HTTP_STATUS.NOT_FOUND,
        };
      }

      const profileDataToSave: any = {};

      if (updateData.username) {
        profileDataToSave.username = updateData.username;
      }

      if (updateData.phone) {
        profileDataToSave.phone = updateData.phone;
      }

      if (updateData.image) {
        console.log("Uploading profile photo to Cloudinary");
        const imageUrl = await this.fileUploader.uploadFile(updateData.image, {
          folder: "fixify/users/profile",
        });

        if (imageUrl) {
          profileDataToSave.image = imageUrl;
          console.log("Profile photo uploaded successfully:", imageUrl);
        } else {
          console.log("Failed to upload profile photo");
        }
      }

      console.log("Final data to save:", profileDataToSave);

      const updatedUser = await this.userRepository.editProfile(
        userId,
        profileDataToSave
      );

      console.log("updatedUser from the user repository:", updatedUser);

      return {
        success: true,
        message: "Profile updated successfully",
        status: HTTP_STATUS.OK,
        user: updatedUser,
      };
    } catch (error) {
      console.log("Error in editProfile service:", error);
      return {
        success: false,
        message: "An error occurred while updating profile",
        status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
      };
    }
  }

  async addMoney(userId: string, amount: number): Promise<AddMoneyResponse> {
    try {
      console.log("Add money service called:", { userId, amount });

      if (!amount || amount <= 0) {
        return {
          success: false,
          status: HTTP_STATUS.BAD_REQUEST,
          message: "Invalid amount. Amount must be greater than 0",
        };
      }

      if (amount < 100) {
        return {
          success: false,
          status: HTTP_STATUS.BAD_REQUEST,
          message: "Minimum amount to add is ₹100",
        };
      }

      if (amount > 1000) {
        return {
          success: false,
          status: HTTP_STATUS.BAD_REQUEST,
          message: "Maximum amount to add is ₹1,000",
        };
      }

      let wallet = await this.walletRepository.getWalletByUserId(userId);
      if (!wallet) {
        wallet = await this.walletRepository.createWallet(userId);
      }

      const amountInCents = Math.round(amount * 100);

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        mode: "payment",
        line_items: [
          {
            price_data: {
              currency: "inr",
              product_data: {
                name: "Wallet Top-up",
                description: "Add money to your Fixify wallet",
              },
              unit_amount: amountInCents,
            },
            quantity: 1,
          },
        ],
        metadata: {
          userId: userId,
          amount: amount.toString(),
          type: "wallet_topup",
        },
        success_url: `${config.CLIENT_URL}/user/wallet?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${config.CLIENT_URL}/user/wallet-cancelled`,
      });

      console.log("Stripe session created:", session.id);

      return {
        success: true,
        status: HTTP_STATUS.OK,
        message: "Payment session created successfully",
        data: {
          checkoutUrl: session.url!,
          sessionId: session.id,
          requiresPayment: true,
        },
      };
    } catch (error) {
      console.log("Error in addMoney service:", error);
      return {
        success: false,
        message: "Failed to create payment session",
        status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
      };
    }
  }

  async verifyWalletStripeSession(
    sessionId: string,
    userId: string
  ): Promise<{
    success: boolean;
    status: number;
    message: string;
    data?: {
      wallet: IWallet | null;
      transaction: IWalletTransaction | null;
    };
  }> {
    try {
      console.log("Verifying Stripe session:", { sessionId, userId });

      const existingTransaction =
        await this.walletTransactionRepository.findByReferenceId(
          sessionId,
          "Credit"
        );

      if (existingTransaction) {
        console.log("Session already processed:", sessionId);
        const wallet = await this.walletRepository.getWalletByUserId(userId);
        return {
          success: true,
          status: HTTP_STATUS.OK,
          message: "Transaction already processed successfully",
          data: {
            wallet,
            transaction: existingTransaction,
          },
        };
      }

      const session = await stripe.checkout.sessions.retrieve(sessionId);

      if (!session || session.payment_status !== "paid") {
        return {
          success: false,
          status: HTTP_STATUS.BAD_REQUEST,
          message: "Payment not completed or session not found",
        };
      }

      const amount = parseFloat(session.metadata?.amount || "0");

      console.log("amount in the userService:", amount);

      if (!amount || amount <= 0) {
        return {
          success: false,
          status: HTTP_STATUS.BAD_REQUEST,
          message: "Invalid amount in session",
        };
      }

      if (session.metadata?.userId !== userId) {
        return {
          success: false,
          status: HTTP_STATUS.FORBIDDEN,
          message: "Session does not belong to this user",
        };
      }

      const result = await this.walletRepository.addMoney(
        amount,
        userId,
        sessionId
      );

      console.log("Wallet updated successfully:", result.wallet);
      console.log("Transaction created:", result.transaction);

      return {
        success: true,
        status: HTTP_STATUS.OK,
        message: "Money added to wallet successfully",
        data: {
          wallet: result.wallet,
          transaction: result.transaction,
        },
      };
    } catch (error) {
      console.log("Error verifying Stripe session:", error);
      return {
        success: false,
        status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
        message: "Internal server error",
      };
    }
  }

  async getWalletBalance(userId: string): Promise<{
    success: boolean;
    status: number;
    message: string;
    data?: { balance: number };
  }> {
    try {
      console.log(
        "entering to the user service function which fetches the wallet balance for the user"
      );
      console.log(
        "userId in the user service function fetching the wallet balance:",
        userId
      );

      let fetchedWallet = await this.walletRepository.getWalletByUserId(userId);

      console.log(`fetched wallet with the ${userId}:`, fetchedWallet);

      if (!fetchedWallet) {
        console.log(`Wallet not found for user ${userId}, creating new wallet`);
        try {
          fetchedWallet = await this.walletRepository.createWallet(userId);
          console.log(`Created new wallet for user ${userId}:`, fetchedWallet);
        } catch (createError) {
          console.log("Error creating wallet:", createError);
          return {
            success: false,
            message: "Failed to create wallet",
            status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
          };
        }
      }

      return {
        success: true,
        message: "Wallet balance fetched successfully",
        status: HTTP_STATUS.OK,
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
        status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
      };
    }
  }

  async getAllWalletTransactions(options: {
    page?: number;
    limit?: number;
    userId: string;
  }): Promise<{
    success: boolean;
    status: number;
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
        "entered to the user service fetching all the wallet tranasctions for the user"
      );
      const page = options.page || 1;
      const limit = options.limit || 5;
      const userId = options.userId;
      console.log(
        "userId in the userService fetching all the wallet transactions:",
        userId
      );

      const fetchedWallet = await this.walletRepository.getWalletByUserId(
        userId
      );

      console.log(
        "fetched wallet in the user wallet transations fetching services:",
        fetchedWallet
      );

      const walletId = fetchedWallet?._id?.toString();

      if (!walletId) {
        return {
          success: false,
          status: HTTP_STATUS.NOT_FOUND,
          message: "Wallet not found for the user",
        };
      }

      const result =
        await this.walletTransactionRepository.getUserWalletTranasctions({
          page,
          limit,
          userId,
          walletId,
        });

      console.log("fetched wallet transactions for the user:", result);
      return {
        success: true,
        status: HTTP_STATUS.OK,
        message: "Users fetched successfully",
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
        status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
        message: "Something went wrong while fetching user wallet transactions",
      };
    }
  }
}
