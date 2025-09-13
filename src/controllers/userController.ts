import { IUserService } from "../interfaces/Iservices/IuserService";
import { ITechnicianService } from "../interfaces/Iservices/ItechnicianService";
import { Request, Response } from "express";
import { HTTP_STATUS } from "../utils/httpStatus";
import { inject, injectable } from "tsyringe";
import {
  createSuccessResponse,
  createErrorResponse,
} from "../utils/responseHelper";
import { AuthenticatedRequest } from "../middlewares/AuthMiddleware";
import config from "../config/env";

@injectable()
export class UserController {
  constructor(
    @inject("IUserService") private _userService: IUserService,
    @inject("ITechnicianService")
    private _technicianService: ITechnicianService
  ) {}

  async register(req: Request, res: Response): Promise<void> {
    try {
      console.log("entering to the register function in userController");
      const data = req.body;
      console.log("data:", data);
      const serviceResponse = await this._userService.userSignUp(data);
      console.log("response in register:", serviceResponse);

      if (serviceResponse.success) {
        res
          .status(HTTP_STATUS.CREATED)
          .json(
            createSuccessResponse(serviceResponse.data, serviceResponse.message)
          );
      } else {
        res
          .status(HTTP_STATUS.BAD_REQUEST)
          .json(
            createErrorResponse(
              serviceResponse.message || "Registration failed"
            )
          );
      }
    } catch (error) {
      console.log("error occurred", error);
      res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json(createErrorResponse("Internal Server Error"));
    }
  }

  async verifyOtp(req: Request, res: Response): Promise<void> {
    try {
      console.log("entering into the verify otp function in userController");
      const data = req.body;
      console.log("userData in verifyOtp controller:", data);
      const serviceResponse = await this._userService.verifyOtp(data);
      console.log("response in verifyOtp controller:", serviceResponse);

      if (serviceResponse.success) {
        res
          .status(200)
          .json(createSuccessResponse(null, serviceResponse.message));
      } else {
        const statusCode = serviceResponse.message?.includes("not found")
          ? HTTP_STATUS.NOT_FOUND
          : serviceResponse.message?.includes("expired")
          ? HTTP_STATUS.NOT_FOUND
          : serviceResponse.message?.includes("Invalid OTP")
          ? HTTP_STATUS.UNAUTHORIZED
          : serviceResponse.message?.includes("already verified")
          ? HTTP_STATUS.CONFLICT
          : HTTP_STATUS.BAD_REQUEST;

        res
          .status(statusCode)
          .json(
            createErrorResponse(
              serviceResponse.message || "OTP verification failed"
            )
          );
      }
    } catch (error) {
      console.log("error occurred:", error);
      res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json(createErrorResponse("Internal Server Error"));
    }
  }

  async resendOtp(req: Request, res: Response): Promise<void> {
    try {
      console.log("entering into the resend otp functionality");
      const { email } = req.body;
      console.log("email in the resend otp in the controller:", email);
      const serviceResponse = await this._userService.resendOtp(email);
      console.log("response from the resendotp controller:", serviceResponse);

      if (serviceResponse.success) {
        res.status(HTTP_STATUS.OK).json(
          createSuccessResponse(
            {
              email: serviceResponse.email,
            },
            serviceResponse.message
          )
        );
      } else {
        const statusCode = serviceResponse.message?.includes("not found")
          ? HTTP_STATUS.NOT_FOUND
          : HTTP_STATUS.BAD_REQUEST;
        res
          .status(statusCode)
          .json(
            createErrorResponse(
              serviceResponse.message || "Failed to resend OTP"
            )
          );
      }
    } catch (error) {
      console.log("error in the resendOtp controller", error);
      res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json(createErrorResponse("Internal Server Error"));
    }
  }

  async forgotPassword(req: Request, res: Response): Promise<void> {
    try {
      console.log("Entering forgotPassword function in userController");
      const { email } = req.body;

      const serviceResponse = await this._userService.forgotPassword({ email });
      console.log("Response from forgotPassword service:", serviceResponse);

      if (serviceResponse.success) {
        res.status(HTTP_STATUS.OK).json(
          createSuccessResponse(
            {
              email: serviceResponse.email,
            },
            serviceResponse.message
          )
        );
      } else {
        const statusCode = serviceResponse.message?.includes("not found")
          ? HTTP_STATUS.NOT_FOUND
          : serviceResponse.message?.includes("verify your email")
          ? HTTP_STATUS.FORBIDDEN
          : serviceResponse.message?.includes("blocked")
          ? HTTP_STATUS.FORBIDDEN
          : HTTP_STATUS.BAD_REQUEST;
        res
          .status(statusCode)
          .json(
            createErrorResponse(
              serviceResponse.message || "Failed to send reset email"
            )
          );
      }
    } catch (error) {
      console.log("Error in forgotPassword controller:", error);
      res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json(createErrorResponse("Internal Server Error"));
    }
  }

  async resetPassword(req: Request, res: Response): Promise<void> {
    try {
      console.log("Entering resetPassword function in userController");
      const { email, password } = req.body;

      const serviceResponse = await this._userService.resetPassword({
        email,
        password,
      });
      console.log("Response from resetPassword service:", serviceResponse);

      if (serviceResponse.success) {
        res
          .status(HTTP_STATUS.OK)
          .json(createSuccessResponse(null, serviceResponse.message));
      } else {
        const statusCode = serviceResponse.message?.includes("not found")
          ? HTTP_STATUS.NOT_FOUND
          : serviceResponse.message?.includes("verify your email")
          ? HTTP_STATUS.FORBIDDEN
          : serviceResponse.message?.includes("blocked")
          ? HTTP_STATUS.FORBIDDEN
          : HTTP_STATUS.BAD_REQUEST;
        res
          .status(statusCode)
          .json(
            createErrorResponse(
              serviceResponse.message || "Failed to reset password"
            )
          );
      }
    } catch (error) {
      console.log("Error in resetPassword controller:", error);
      res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json(createErrorResponse("Internal Server Error"));
    }
  }

  async login(req: Request, res: Response): Promise<void> {
    try {
      console.log("entering the user login function in usercontroller");
      const data = req.body;

      const serviceResponse = await this._userService.login(data);
      console.log("response from the login controller", serviceResponse);

      if (serviceResponse.success) {
        res.cookie("refresh_token", serviceResponse.refresh_token, {
          httpOnly: true,
          secure: config.NODE_ENV === "production",
          sameSite:
            config.NODE_ENV === "production"
              ? ("strict" as const)
              : ("lax" as const),
          maxAge: config.REFRESH_TOKEN_COOKIE_MAX_AGE,
        });

        res.status(HTTP_STATUS.OK).json(
          createSuccessResponse(
            {
              user: serviceResponse.data,
              access_token: serviceResponse.access_token,
            },
            serviceResponse.message
          )
        );
      } else {
        const statusCode = serviceResponse.message?.includes("not found")
          ? HTTP_STATUS.NOT_FOUND
          : serviceResponse.message?.includes("Invalid password")
          ? HTTP_STATUS.UNAUTHORIZED
          : serviceResponse.message?.includes("verify your email")
          ? HTTP_STATUS.FORBIDDEN
          : serviceResponse.message?.includes("blocked")
          ? HTTP_STATUS.FORBIDDEN
          : HTTP_STATUS.BAD_REQUEST;

        res
          .status(statusCode)
          .json(createErrorResponse(serviceResponse.message || "Login failed"));
      }
    } catch (error) {
      console.log("error:", error);
      res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json(createErrorResponse("Internal server error"));
    }
  }
  async getProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      console.log("Entering user profile fetch");
      const userId = req.user?.id;

      if (!userId) {
        res
          .status(HTTP_STATUS.UNAUTHORIZED)
          .json(createErrorResponse("Unauthorized access"));
        return;
      }

      const serviceResponse = await this._userService.getUserProfile(userId);

      if (serviceResponse.success) {
        res
          .status(HTTP_STATUS.OK)
          .json(
            createSuccessResponse(serviceResponse.user, serviceResponse.message)
          );
      } else {
        const statusCode = serviceResponse.message?.includes("not found")
          ? HTTP_STATUS.NOT_FOUND
          : HTTP_STATUS.BAD_REQUEST;
        res
          .status(statusCode)
          .json(
            createErrorResponse(
              serviceResponse.message || "Failed to fetch profile"
            )
          );
      }
    } catch (error) {
      console.log("Error fetching user profile:", error);
      res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json(createErrorResponse("Internal Server Error"));
    }
  }

  async editProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      console.log("entering to the user editing the profile function");
      const userId = req.user?.id;

      if (!userId) {
        res
          .status(HTTP_STATUS.UNAUTHORIZED)
          .json(createErrorResponse("Unauthorized access"));
        return;
      }

      console.log("Received form data:", req.body);
      console.log("Received files:", req.file);

      const profileUpdateData = {
        username: req.body.username,
        phone: req.body.phone,
        image: req.file?.path as string | undefined,
      };

      console.log("userId from the edit profile:", userId);
      console.log("Profile update data:", profileUpdateData);

      const serviceResponse = await this._userService.editProfile(
        userId,
        profileUpdateData
      );

      console.log(
        "response in the user editing profile function:",
        serviceResponse
      );

      if (serviceResponse.success) {
        res
          .status(HTTP_STATUS.OK)
          .json(
            createSuccessResponse(serviceResponse.user, serviceResponse.message)
          );
      } else {
        const statusCode = serviceResponse.message?.includes("not found")
          ? HTTP_STATUS.NOT_FOUND
          : HTTP_STATUS.BAD_REQUEST;
        res
          .status(statusCode)
          .json(
            createErrorResponse(
              serviceResponse.message || "Failed to update profile"
            )
          );
      }
    } catch (error) {
      console.log("Error in editProfile controller:", error);
      res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json(createErrorResponse("Internal Server Error"));
    }
  }

  async getAllUsers(req: Request, res: Response): Promise<void> {
    try {
      console.log("function fetching all the users");
      const page = req.query.page
        ? parseInt(req.query.page as string)
        : undefined;
      const limit = req.query.page
        ? parseInt(req.query.limit as string)
        : undefined;
      const search = req.query.search
        ? (req.query.search as string)
        : undefined;
      const status = req.query.status
        ? (req.query.status as string)
        : undefined;

      const serviceResponse = await this._userService.getAllUsers({
        page,
        limit,
        search,
        status,
      });

      console.log(
        "result from the fetching all users controller:",
        serviceResponse
      );

      if (serviceResponse.success) {
        res
          .status(HTTP_STATUS.OK)
          .json(
            createSuccessResponse(serviceResponse.data, serviceResponse.message)
          );
      } else {
        res
          .status(HTTP_STATUS.BAD_REQUEST)
          .json(
            createErrorResponse(
              serviceResponse.message || "Failed to fetch users"
            )
          );
      }
    } catch (error) {
      console.error("Error in getAllUsers controller:", error);
      res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json(createErrorResponse("Error fetching users"));
    }
  }

  async toggleUserStatus(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;

      const serviceResponse = await this._userService.toggleUserStatus(userId);

      if (serviceResponse.success) {
        res
          .status(HTTP_STATUS.OK)
          .json(
            createSuccessResponse(serviceResponse.data, serviceResponse.message)
          );
      } else {
        const statusCode = serviceResponse.message?.includes("not found")
          ? HTTP_STATUS.NOT_FOUND
          : HTTP_STATUS.BAD_REQUEST;
        res
          .status(statusCode)
          .json(
            createErrorResponse(
              serviceResponse.message || "Failed to toggle user status"
            )
          );
      }
    } catch (error) {
      console.error("Error in toggleUserStatus controller:", error);
      res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json(createErrorResponse("Internal server error"));
    }
  }

  async getNearbyTechnicians(req: Request, res: Response): Promise<void> {
    try {
      console.log(
        "entering the function which fetches the nearby technicians for the user:"
      );

      const designationId = req.query.designationId as string;
      const userLongitude = parseFloat(req.query.longitude as string);
      const userLatitude = parseFloat(req.query.latitude as string);
      const radius = req.query.radius
        ? parseFloat(req.query.radius as string)
        : 10;

      console.log(
        "filter parameters in the get nearby technicians in the user controller:",
        { designationId, userLongitude, userLatitude, radius }
      );

      if (!designationId || isNaN(userLongitude) || isNaN(userLatitude)) {
        res
          .status(HTTP_STATUS.BAD_REQUEST)
          .json(
            createErrorResponse(
              "Invalid or missing parameters. Required: designationId, longitude (user's), latitude (user's)"
            )
          );
        return;
      }

      const serviceResponse =
        await this._technicianService.getNearbyTechnicians(
          designationId,
          userLongitude,
          userLatitude,
          radius
        );

      console.log("response in the user controller:", serviceResponse);

      if (serviceResponse.success) {
        res
          .status(HTTP_STATUS.OK)
          .json(
            createSuccessResponse(serviceResponse.data, serviceResponse.message)
          );
      } else {
        res
          .status(HTTP_STATUS.BAD_REQUEST)
          .json(
            createErrorResponse(
              serviceResponse.message || "Failed to fetch nearby technicians"
            )
          );
      }
    } catch (error) {
      console.log(
        "error occurred while fetching the nearby technicians for the user:",
        error
      );
      res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json(createErrorResponse("Internal Server Error"));
    }
  }

  async logout(req: Request, res: Response): Promise<void> {
    try {
      console.log("entering the logout function from the user auth controller");
      res.clearCookie("refresh_token", {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
      });
      res
        .status(HTTP_STATUS.OK)
        .json(createSuccessResponse(null, "Logged out successfully"));
    } catch (error) {
      console.log("error occured while user logging out:", error);
      res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json(createErrorResponse("Internal server error occurred"));
    }
  }
}
