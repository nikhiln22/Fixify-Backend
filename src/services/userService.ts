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
  LoginData,
  LoginResponse,
  RegisterResponse,
  ResendOtpResponse,
  ResetPasswordData,
  ResetPasswordResponse,
  SignupUserData,
  TempUserResponse,
  VerifyOtpData,
  ToggleUserStatusResponse,
  UserProfileResponse,
  EditProfileResponse,
  UserProfileUpdateData,
  AddMoneyResponse,
} from "../interfaces/DTO/IServices/IuserService";
import { ITempUserRepository } from "../interfaces/Irepositories/ItempUserRepository";
import { IUserRepository } from "../interfaces/Irepositories/IuserRepository";
import { IUserService } from "../interfaces/Iservices/IuserService";
import { ITempUser } from "../interfaces/Models/ItempUser";
import { IEmailService } from "../interfaces/Iemail/Iemail";
import { IJwtService } from "../interfaces/Ijwt/Ijwt";
import { IOTPService } from "../interfaces/Iotp/IOTP";
import { IPasswordHasher } from "../interfaces/IpasswordHasher/IpasswordHasher";
import { IRedisService } from "../interfaces/Iredis/Iredis";
import { OtpVerificationResult } from "../interfaces/Iotp/IOTP";
import { inject, injectable } from "tsyringe";
import { IUser } from "../interfaces/Models/Iuser";
import { IFileUploader } from "../interfaces/IfileUploader/IfileUploader";
import { IWalletRepository } from "../interfaces/Irepositories/IwalletRepository";
import { IWalletTransactionRepository } from "../interfaces/Irepositories/IwalletTransactionRepository";
import { IWallet } from "../interfaces/Models/Iwallet";
import { stripe } from "../config/stripeConfig";
import config from "../config/env";
import { IWalletTransaction } from "../interfaces/Models/IwalletTransaction";

@injectable()
export class UserService implements IUserService {
  constructor(
    @inject("IUserRepository") private _userRepository: IUserRepository,
    @inject("ITempUserRepository")
    private _tempUserRepository: ITempUserRepository,
    @inject("IEmailService") private _emailService: IEmailService,
    @inject("IOTPService") private _otpService: IOTPService,
    @inject("IPasswordHasher") private _passwordService: IPasswordHasher,
    @inject("IJwtService") private _jwtService: IJwtService,
    @inject("IRedisService") private _redisService: IRedisService,
    @inject("IFileUploader") private _fileUploader: IFileUploader,
    @inject("IWalletRepository") private _walletRepository: IWalletRepository,
    @inject("IWalletTransactionRepository")
    private _walletTransactionRepository: IWalletTransactionRepository
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

  async userSignUp(data: SignupUserData): Promise<TempUserResponse> {
    try {
      console.log(
        "entering to the usersignup function in the userauth service"
      );
      console.log("data:", data);
      const { email, password } = data;
      const result = await this._userRepository.findByEmail(email);
      if (result.success) {
        return {
          message: "user already exists",
          success: false,
        };
      }
      const hashedPassword = await this._passwordService.hash(password);

      const otp = await this.generateAndSendOtp(email, OtpPurpose.REGISTRATION);

      console.log("Generated Otp for the user Registration:", otp);

      const expiresAt = new Date(Date.now() + TEMP_USER_EXPIRY_SECONDS * 1000);
      const tempUserData = {
        ...data,
        password: hashedPassword,
        expiresAt,
      } as ITempUser;

      const response = await this._tempUserRepository.createTempUser(
        tempUserData
      );

      console.log("response in userService:", response);
      return {
        message: "User created successfully,OTP sent",
        email,
        tempUserId: response.tempUserId.toString(),
        success: true,
      };
    } catch (error) {
      console.log("Error during user signup:", error);
      throw new Error("An error occured during the user signup");
    }
  }

  async verifyOtp(data: VerifyOtpData): Promise<RegisterResponse> {
    try {
      console.log("entering to the verifyotp function in userService");

      const { otp, tempUserId, email, purpose } = data;

      let userEmail = email;

      if (OtpPurpose.REGISTRATION === purpose && tempUserId) {
        const tempUserResponse =
          await this._tempUserRepository.findTempUserById(tempUserId);
        console.log("tempUserResponse:", tempUserResponse);

        if (!tempUserResponse.success || !tempUserResponse.tempUserData) {
          return {
            success: false,
            message: "Temporary user not found or expired",
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
          };
        }

        const userData = {
          username: tempUser.username,
          email: tempUser.email,
          password: tempUser.password,
          phone: tempUser.phone,
        };

        const newUser = await this._userRepository.createUser(userData);
        console.log("new created user:", newUser);

        const newWallet = await this._walletRepository.createWallet(
          newUser._id.toString(),
          "user"
        );
        console.log("newly created wallet:", newWallet);

        const newUserObj = newUser.toObject
          ? newUser.toObject()
          : { ...newUser };
        console.log("newUserObj:", newUserObj);

        const safeUser = { ...newUserObj };
        delete safeUser.password;
        console.log("safeUser:", safeUser);

        const redisKey = this.getOtpRedisKey(
          userEmail,
          OtpPurpose.REGISTRATION
        );
        await this._redisService.delete(redisKey);

        return {
          message: "OTP verified successfully, user registered",
          success: true,
          userData: safeUser,
        };
      } else if (OtpPurpose.PASSWORD_RESET === purpose && userEmail) {
        console.log("password resetting in the userAuthService");
        const user = await this._userRepository.findByEmail(userEmail);
        console.log("user from the password resetting:", user);
        if (!user.success || !user.userData) {
          return {
            success: false,
            message: "User not found with this email",
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
      console.log("entering resendotp function in the userservice");
      const tempUser = await this._tempUserRepository.findTempUserByEmail(data);
      console.log("tempuser in resendotp user service:", tempUser);

      const user = await this._userRepository.findByEmail(data);
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
      console.log("Entering forgotPassword in userService");
      const { email } = data;

      const user = await this._userRepository.findByEmail(email);
      if (!user.success || !user.userData) {
        return {
          success: false,
          message: "User not found with this email",
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
      console.log("Entering resetPassword in userService");
      const { email, password } = data;

      const user = await this._userRepository.findByEmail(email);
      console.log("userData in resetPasssword:", user);
      if (!user.success || !user.userData) {
        return {
          success: false,
          message: "User not found with this email",
        };
      }

      const hashedPassword = await this._passwordService.hash(password);

      const updateResult = await this._userRepository.updatePassword(
        email,
        hashedPassword
      );

      if (!updateResult.success) {
        return {
          success: false,
          message: "Failed to update password",
        };
      }

      const redisKey = `forgotPassword:${email}`;
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
      const user = await this._userRepository.findByEmail(email);
      console.log("user", user);
      if (!user.success || !user.userData) {
        return {
          success: false,
          message: "user not found",
        };
      }

      const isPasswordValid = await this._passwordService.verify(
        user.userData.password,
        password
      );

      if (!isPasswordValid) {
        return {
          success: false,
          message: "invalid password",
        };
      }

      if (!user.userData.status) {
        return {
          success: false,
          message: "Your account has been blocked. Please contact support.",
        };
      }

      const userId = String(user.userData._id);
      console.log("userId from login:", userId);
      const access_token = this._jwtService.generateAccessToken(
        userId,
        Roles.USER
      );

      const refresh_token = this._jwtService.generateRefreshToken(
        userId,
        Roles.USER
      );

      return {
        success: true,
        message: "Login Successfull",
        access_token,
        refresh_token,
        data: {
          _id: user.userData._id,
          username: user.userData.username,
          email: user.userData.email,
          phone: user.userData.phone,
          image: user.userData.image,
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

  async getAllUsers(options: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
  }): Promise<{
    success: boolean;
    message: string;
    data?: {
      users: IUser[];
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
      const result = await this._userRepository.getAllUsers({
        page,
        limit,
        search: options.search,
        status: options.status,
      });

      console.log("result from the user service:", result);

      return {
        success: true,
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
        message: "Something went wrong while fetching users",
      };
    }
  }

  async toggleUserStatus(id: string): Promise<ToggleUserStatusResponse> {
    try {
      const user = await this._userRepository.findById(id);
      console.log("User fetched from repository:", user);

      if (!user) {
        return {
          success: false,
          message: "User not found",
        };
      }

      const newStatus = !user.status;
      const response = await this._userRepository.blockUser(id, newStatus);
      console.log(
        "Response after toggling user status from the user repository:",
        response
      );

      return {
        success: true,
        message: `User successfully ${newStatus ? "unblocked" : "blocked"}`,
        user: { ...user.toObject(), status: newStatus },
      };
    } catch (error) {
      console.error("Error toggling user status:", error);
      return {
        success: false,
        message: "Failed to toggle user status",
      };
    }
  }

  async getUserProfile(userId: string): Promise<UserProfileResponse> {
    try {
      console.log("Fetching user profile in user service for ID:", userId);

      const userData = await this._userRepository.findById(userId);

      if (!userData) {
        return {
          message: "User not found",
          success: false,
        };
      }

      return {
        message: "User profile fetched successfully",
        success: true,
        user: userData,
      };
    } catch (error) {
      console.error("Error fetching user profile:", error);
      return {
        message: "Failed to fetch user profile",
        success: false,
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

      const existingUser = await this._userRepository.findById(userId);
      if (!existingUser) {
        return {
          success: false,
          message: "User not found",
        };
      }

      const profileDataToSave: UserProfileUpdateData = {};

      if (updateData.username) {
        profileDataToSave.username = updateData.username;
      }

      if (updateData.phone) {
        profileDataToSave.phone = updateData.phone;
      }

      if (updateData.image) {
        console.log("Uploading profile photo to Cloudinary");
        const imageUrl = await this._fileUploader.uploadFile(updateData.image, {
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

      const updatedUser = await this._userRepository.editProfile(
        userId,
        profileDataToSave
      );

      console.log("updatedUser from the user repository:", updatedUser);

      return {
        success: true,
        message: "Profile updated successfully",
        user: updatedUser,
      };
    } catch (error) {
      console.log("Error in editProfile service:", error);
      return {
        success: false,
        message: "An error occurred while updating profile",
      };
    }
  }

  async addMoney(userId: string, amount: number): Promise<AddMoneyResponse> {
    try {
      console.log("Add money service called:", { userId, amount });

      if (!amount || amount <= 0) {
        return {
          success: false,
          message: "Invalid amount. Amount must be greater than 0",
        };
      }

      if (amount < 100) {
        return {
          success: false,
          message: "Minimum amount to add is ₹100",
        };
      }

      if (amount > 1000) {
        return {
          success: false,
          message: "Maximum amount to add is ₹1,000",
        };
      }

      let wallet = await this._walletRepository.getWalletByOwnerId(
        userId,
        "user"
      );
      if (!wallet) {
        wallet = await this._walletRepository.createWallet(userId, "user");
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
      };
    }
  }

  async verifyWalletStripeSession(
    sessionId: string,
    userId: string
  ): Promise<{
    success: boolean;
    message: string;
    data?: {
      wallet: IWallet | null;
      transaction: IWalletTransaction | null;
    };
  }> {
    try {
      console.log("Verifying Stripe session:", { sessionId, userId });

      const existingTransaction =
        await this._walletTransactionRepository.findByReferenceId(
          sessionId,
          "Credit"
        );

      if (existingTransaction) {
        console.log("Session already processed:", sessionId);
        const wallet = await this._walletRepository.getWalletByOwnerId(
          userId,
          "user"
        );
        return {
          success: true,
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
          message: "Payment not completed or session not found",
        };
      }

      const amount = parseFloat(session.metadata?.amount || "0");

      console.log("amount in the userService:", amount);

      if (!amount || amount <= 0) {
        return {
          success: false,
          message: "Invalid amount in session",
        };
      }

      if (session.metadata?.userId !== userId) {
        return {
          success: false,
          message: "Session does not belong to this user",
        };
      }

      const result = await this._walletRepository.addMoney(
        amount,
        userId,
        "user",
        sessionId
      );

      console.log("Wallet updated successfully:", result.wallet);
      console.log("Transaction created:", result.transaction);

      return {
        success: true,
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
        message: "Internal server error",
      };
    }
  }

  async getWalletBalance(userId: string): Promise<{
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
        userId
      );

      let fetchedWallet = await this._walletRepository.getWalletByOwnerId(
        userId,
        "user"
      );

      console.log(`fetched wallet with the ${userId}:`, fetchedWallet);

      if (!fetchedWallet) {
        console.log(`Wallet not found for user ${userId}, creating new wallet`);
        try {
          fetchedWallet = await this._walletRepository.createWallet(
            userId,
            "user"
          );
          console.log(`Created new wallet for user ${userId}:`, fetchedWallet);
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
    userId: string;
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
      const userId = options.userId;

      const result =
        await this._walletTransactionRepository.getOwnerWalletTransactions({
          page,
          limit,
          ownerId: userId,
          ownerType: "user",
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

  async countActiveUsers(): Promise<number> {
    try {
      console.log(
        "entered the function that finds the total number of the active users"
      );
      const activeUsers = await this._userRepository.countActiveUsers();
      console.log("activeUsers:", activeUsers);
      return activeUsers;
    } catch (error) {
      console.log(
        "error occured while fteching the total active users:",
        error
      );
      return 0;
    }
  }
}
