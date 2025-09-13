import { ITechnicianService } from "../interfaces/Iservices/ItechnicianService";
import { Request, Response } from "express";
import { HTTP_STATUS } from "../utils/httpStatus";
import { inject, injectable } from "tsyringe";
import {
  createErrorResponse,
  createSuccessResponse,
} from "../utils/responseHelper";
import { AuthenticatedRequest } from "../middlewares/AuthMiddleware";
import config from "../config/env";

@injectable()
export class TechnicianController {
  constructor(
    @inject("ITechnicianService")
    private _technicianService: ITechnicianService
  ) {}

  async register(req: Request, res: Response): Promise<void> {
    try {
      console.log(
        "entering to the register function in technicianAuthController"
      );
      const data = req.body;
      console.log("data:", data);

      const serviceResponse = await this._technicianService.technicianSignUp(
        data
      );
      console.log("response in technician register:", serviceResponse);

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
      console.log(
        "entering into the verify otp function in technicianAuthController"
      );
      const data = req.body;
      console.log("technicianData in verifyOtp controller:", data);

      const serviceResponse = await this._technicianService.verifyOtp(data);
      console.log(
        "response in verifyOtp controller in technician:",
        serviceResponse
      );

      if (serviceResponse.success) {
        res
          .status(HTTP_STATUS.OK)
          .json(createSuccessResponse(null, serviceResponse.message));
      } else {
        const statusCode = serviceResponse.message?.includes("not found")
          ? HTTP_STATUS.NOT_FOUND
          : serviceResponse.message?.includes("expired")
          ? HTTP_STATUS.BAD_REQUEST
          : serviceResponse.message?.includes("Invalid OTP")
          ? HTTP_STATUS.UNAUTHORIZED
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
      console.log(
        "entering into the resend otp functionality in the technicianAuthController"
      );
      const { email } = req.body;

      const serviceResponse = await this._technicianService.resendOtp(email);
      console.log(
        "response from the technician resendotp controller:",
        serviceResponse
      );

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

  async login(req: Request, res: Response): Promise<void> {
    try {
      console.log(
        "entering the technician login function in technicianAuthController"
      );
      const data = req.body;

      const serviceResponse = await this._technicianService.login(data);
      console.log(
        "response from the technician login controller",
        serviceResponse
      );

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
              technician: serviceResponse.data,
              access_token: serviceResponse.access_token,
            },
            serviceResponse.message
          )
        );
      } else {
        const statusCode = serviceResponse.message?.includes(
          "Technician not found"
        )
          ? HTTP_STATUS.NOT_FOUND
          : serviceResponse.message?.includes("Invalid password")
          ? HTTP_STATUS.UNAUTHORIZED
          : serviceResponse.message?.includes("Blocked")
          ? HTTP_STATUS.FORBIDDEN
          : HTTP_STATUS.BAD_REQUEST;

        res
          .status(statusCode)
          .json(createErrorResponse(serviceResponse.message));
      }
    } catch (error) {
      console.log("error:", error);
      res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json(createErrorResponse("Internal server error"));
    }
  }

  async forgotPassword(req: Request, res: Response): Promise<void> {
    try {
      console.log(
        "Entering forgotPassword function in technicianAuthController"
      );
      const { email } = req.body;

      const serviceResponse = await this._technicianService.forgotPassword({
        email,
      });
      console.log(
        "Response from forgotPassword service in technician:",
        serviceResponse
      );

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
      console.log(
        "Entering resetPassword function in technicianAuthController"
      );
      const { email, password } = req.body;

      const serviceResponse = await this._technicianService.resetPassword({
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

  async submitQualifications(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    try {
      console.log("Entering technician qualification submission");
      const data = req.body;
      console.log("Received data:", data);

      const technicianId = req.user?.id;
      console.log("technicianId:", technicianId);

      const files = req.files as
        | {
            [fieldname: string]: Express.Multer.File[];
          }
        | undefined;

      const qualificationData = {
        experience: req.body.experience,
        designation: req.body.designation,
        longitude: req.body.longitude,
        latitude: req.body.latitude,
        address: req.body.address,
        about: req.body.about,
        profilePhoto: files?.profilePhoto?.[0],
        certificates: files?.certificates,
      };

      console.log("Processing qualification data:", qualificationData);

      if (!technicianId) {
        res
          .status(HTTP_STATUS.UNAUTHORIZED)
          .json(createErrorResponse("User not authenticated"));
        return;
      }

      const serviceResponse =
        await this._technicianService.submitTechnicianQualifications(
          technicianId,
          qualificationData
        );

      if (serviceResponse.success) {
        console.log("EMITTING NOTIFICATION TO ADMIN:", serviceResponse.adminId);
        console.log("Room name:", `admin_${serviceResponse.adminId}`);
        req.io
          ?.to(`admin_${serviceResponse.adminId}`)
          .emit("new_notification", {
            title: "New Application",
            message: "Technician application ready for review",
          });
        console.log("Notification emitted successfully");
        res
          .status(HTTP_STATUS.OK)
          .json(
            createSuccessResponse(
              serviceResponse.technician,
              serviceResponse.message
            )
          );
      } else {
        res
          .status(HTTP_STATUS.BAD_REQUEST)
          .json(
            createErrorResponse(
              serviceResponse.message || "Failed to submit qualifications"
            )
          );
      }
    } catch (error) {
      console.log("Some error occurred:", error);
      res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json(createErrorResponse("Internal Server Error"));
    }
  }

  async getProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      console.log("Entering technician profile fetch");
      const technicianId = req.user?.id;

      if (!technicianId) {
        res
          .status(HTTP_STATUS.UNAUTHORIZED)
          .json(createErrorResponse("Unauthorized access"));
        return;
      }

      const serviceResponse =
        await this._technicianService.getTechnicianProfile(technicianId);

      if (serviceResponse.success) {
        res
          .status(HTTP_STATUS.OK)
          .json(
            createSuccessResponse(
              serviceResponse.technician,
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
              serviceResponse.message || "Failed to fetch profile"
            )
          );
      }
    } catch (error) {
      console.log("Error fetching technician profile:", error);
      res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json(createErrorResponse("Internal Server Error"));
    }
  }

  async getTechnicianDetails(req: Request, res: Response): Promise<void> {
    try {
      const technicianId = req.params.technicianId;
      console.log(
        "technicianID in the getTechnician Details function:",
        technicianId
      );

      const serviceResponse =
        await this._technicianService.getTechnicianDetails(technicianId);

      if (serviceResponse.success) {
        res
          .status(HTTP_STATUS.OK)
          .json(
            createSuccessResponse(
              serviceResponse.technician,
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
              serviceResponse.message || "Failed to fetch profile"
            )
          );
      }
    } catch (error) {
      console.log("Error fetching technician profile:", error);
      res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json(createErrorResponse("Internal Server Error"));
    }
  }

  // async editProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
  //   try {
  //     console.log(
  //       "entering to the technician controller that edits the technician profile"
  //     );
  //     const techncianId = req.user?.id;
  //     console.log("technicianID in the edit profile:", techncianId);
  //     if (!techncianId) {
  //       res
  //         .status(HTTP_STATUS.UNAUTHORIZED)
  //         .json(createErrorResponse("Unauthorized access"));
  //       return;
  //     }

  //     const profileUpdateData = {
  //       username: req.body.name,
  //       phone: req.body.phone,
  //       about: req.body.about,
  //       experience: req.body.experience,
  //       image: req.file?.path as string | undefined,
  //       certificate: req.file?.path as string | undefined,
  //     };

  //     console.log(
  //       "profile update data in the edit technician profile in the technician controller:",
  //       profileUpdateData
  //     );

  //     const serviceResponse = await this._technicianService.updateProfile(
  //       techncianId,
  //       profileUpdateData
  //     );

  //     console.log(
  //       "serverResponse in the technician controller in edit profile:",
  //       serviceResponse
  //     );

  //     if (serviceResponse.success) {
  //       res
  //         .status(HTTP_STATUS.OK)
  //         .json(
  //           createSuccessResponse(
  //             serviceResponse.technician,
  //             serviceResponse.message
  //           )
  //         );
  //     } else {
  //       const statusCode = serviceResponse.message?.includes("not found")
  //         ? HTTP_STATUS.NOT_FOUND
  //         : HTTP_STATUS.BAD_REQUEST;
  //       res
  //         .status(statusCode)
  //         .json(
  //           createErrorResponse(
  //             serviceResponse.message || "Failed to update profile"
  //           )
  //         );
  //     }
  //   } catch (error) {
  //     console.log(
  //       "Error in editProfile function in the technician controller:",
  //       error
  //     );
  //     res
  //       .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
  //       .json(createErrorResponse("Internal Server Error"));
  //   }
  // }

  async getDashboardStats(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    try {
      console.log(
        "entered to the technician controller that fetches the technician dashboard stats"
      );
      const technicianId = req.user?.id;

      if (!technicianId) {
        res
          .status(HTTP_STATUS.UNAUTHORIZED)
          .json(createErrorResponse("Technician not authenticated"));
        return;
      }

      const serviceResponse = await this._technicianService.getDashboardStats(
        technicianId
      );
      console.log("response from getDashboardStats service:", serviceResponse);

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
              serviceResponse.message || "Failed to fetch dashboard stats"
            )
          );
      }
    } catch (error) {
      console.log("error occurred while fetching dashboard stats:", error);
      res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json(createErrorResponse("Internal Server Error"));
    }
  }

  async getTechnicianEarnings(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    try {
      console.log(
        "fetching the technician earnings in the technician constroller"
      );
      const technicianId = req.user?.id;
      const { period = "daily", startDate, endDate } = req.query;
      console.log("technicianId in the getTechnicianEarnings function");

      if (!technicianId) {
        res
          .status(HTTP_STATUS.UNAUTHORIZED)
          .json(createErrorResponse("Technician not authenticated"));
        return;
      }

      const serviceResponse =
        await this._technicianService.getTechnicianEarningsData(
          technicianId,
          period as "daily" | "weekly" | "monthly" | "yearly",
          startDate as string,
          endDate as string
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
              serviceResponse.message || "Failed to fetch technician earnings"
            )
          );
      }
    } catch (error) {
      console.log(
        "error occured while fetching the techniican earnings:",
        error
      );
      throw error;
    }
  }

  async getTechnicianServiceCategoriesRevenue(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    try {
      console.log(
        "fetching the technician service categories revenue in the technician controller"
      );
      const technicianId = req.user?.id;
      const { startDate, endDate } = req.query;

      if (!technicianId) {
        res
          .status(HTTP_STATUS.UNAUTHORIZED)
          .json(createErrorResponse("Technician not authenticated"));
        return;
      }

      const serviceResponse =
        await this._technicianService.getTechnicianServiceCategoriesData(
          technicianId,
          startDate as string,
          endDate as string
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
              serviceResponse.message ||
                "Failed to fetch service categories data"
            )
          );
      }
    } catch (error) {
      console.log(
        "error occurred while fetching the technician service categories:",
        error
      );
      res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json(createErrorResponse("Internal server error"));
    }
  }

  async getTechnicianBookingStatusDistribution(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    try {
      console.log(
        "fetching the technician booking status distribution in the technician controller"
      );
      const technicianId = req.user?.id;
      const { startDate, endDate } = req.query;

      if (!technicianId) {
        res
          .status(HTTP_STATUS.UNAUTHORIZED)
          .json(createErrorResponse("Technician not authenticated"));
        return;
      }

      const serviceResponse =
        await this._technicianService.getTechnicianBookingStatusData(
          technicianId,
          startDate as string,
          endDate as string
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
              serviceResponse.message || "Failed to fetch booking status data"
            )
          );
      }
    } catch (error) {
      console.log(
        "error occurred while fetching the technician booking status:",
        error
      );
      res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json(createErrorResponse("Internal server error"));
    }
  }

  async getAllTechnicians(req: Request, res: Response): Promise<void> {
    try {
      console.log("fetching all the technicians from the admin controller");
      const page = req.query.page
        ? parseInt(req.query.page as string)
        : undefined;
      const limit = req.query.limit
        ? parseInt(req.query.limit as string)
        : undefined;
      const search = req.query.search
        ? (req.query.search as string)
        : undefined;
      const status = req.query.status
        ? (req.query.status as string)
        : undefined;
      const designation = req.query.designation
        ? (req.query.designation as string)
        : undefined;

      const serviceResponse = await this._technicianService.getAllTechnicians({
        page,
        limit,
        search,
        status,
        designation,
      });

      console.log(
        "result from the fetching all technicians from admin controller:",
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
              serviceResponse.message || "Failed to fetch technicians"
            )
          );
      }
    } catch (error) {
      console.error(
        "Error in getting all technician from admin controller:",
        error
      );
      res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json(createErrorResponse("Error fetching technicians"));
    }
  }

  async toggleTechnicianStatus(req: Request, res: Response): Promise<void> {
    try {
      const { technicianId } = req.params;

      const serviceResponse =
        await this._technicianService.toggleTechnicianStatus(technicianId);

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
              serviceResponse.message || "Failed to toggle technician status"
            )
          );
      }
    } catch (error) {
      console.error("Error in toggleTechnicianStatus controller:", error);
      res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json(createErrorResponse("Internal server error"));
    }
  }

  async getReviews(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const technicianId = req.user?.id;
      console.log(
        "technicianId in the technician controller fetching the reviews:",
        technicianId
      );

      if (!technicianId) {
        res
          .status(HTTP_STATUS.UNAUTHORIZED)
          .json(createErrorResponse("technician not authenticated"));
        return;
      }

      const serviceResponse = await this._technicianService.getReviews(
        technicianId
      );
      console.log(
        "response from the service fetching the technician reviews:",
        serviceResponse
      );

      if (serviceResponse.success) {
        res.status(HTTP_STATUS.OK).json(
          createSuccessResponse(
            {
              reviews: serviceResponse.reviews,
              averageRating: serviceResponse.averageRating,
              totalReviews: serviceResponse.totalReviews,
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
              serviceResponse.message || "Failed to fetch reviews"
            )
          );
      }
    } catch (error) {
      console.log(
        "error occurred while fetching the technician reviews:",
        error
      );
      res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json(createErrorResponse("Internal Server Error"));
    }
  }

  async logout(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      console.log(
        "entering the logout function from the technician auth controller"
      );
      const role = req.user?.role;
      console.log("role in the technician auth controller:", role);

      res.clearCookie("refresh_token", {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
      });

      res
        .status(HTTP_STATUS.OK)
        .json(createSuccessResponse(null, "Logged out successfully"));
    } catch (error) {
      console.log("error occurred while technician logging out:", error);
      res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json(createErrorResponse("Internal server error occurred"));
    }
  }
}
