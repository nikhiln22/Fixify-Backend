import { IuserController } from "../interfaces/Icontrollers/IuserController";
import { IuserService } from "../interfaces/Iservices/IuserService";
import { IServiceService } from "../interfaces/Iservices/IserviceService";
import { Request, Response } from "express";
import { HTTP_STATUS } from "../utils/httpStatus";
import { inject, injectable } from "tsyringe";

@injectable()
export class UserController implements IuserController {
  constructor(
    @inject("IuserService") private userService: IuserService,
    @inject("IServiceService") private serviceService: IServiceService
  ) {}

  async register(req: Request, res: Response): Promise<void> {
    try {
      console.log("entering to the register function in userController");
      const data = req.body;
      console.log("data:", data);
      const response = await this.userService.userSignUp(data);
      console.log("response in register:", response);
      if (response.success) {
        res.status(response.status).json({
          success: response.success,
          message: response.message,
          email: response.email,
          tempUserId: response.tempUserId,
        });
      } else {
        res
          .status(response.status)
          .json({ success: response.success, message: response.message });
      }
    } catch (error) {
      console.log("error occured", error);
      res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json({ success: false, message: "Internal Server Error" });
    }
  }

  async verifyOtp(req: Request, res: Response): Promise<void> {
    try {
      console.log("entering into the verify otp function in userController");
      const data = req.body;
      console.log("userData in verifyOtp controller:", data);
      const response = await this.userService.verifyOtp(data);
      console.log("response in verifyOtp controller:", response);
      if (response.success) {
        res.status(response.status).json(response);
      } else {
        res
          .status(response.status)
          .json({ success: response.success, message: response.message });
      }
    } catch (error) {
      console.log("error occured:", error);
      res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json({ success: false, message: "Internal Server Error" });
    }
  }

  async resendOtp(req: Request, res: Response): Promise<void> {
    try {
      console.log("entering into the resend otp functionality in the ");
      const { email } = req.body;
      const response = await this.userService.resendOtp(email);
      console.log("response from the resendotp controller:", response);
      if (response.success) {
        res.status(response.status).json({
          success: response.success,
          message: response.message,
          email: response.email,
          tempuserId: response.tempUserId,
        });
      } else {
        res
          .status(response.status)
          .json({ success: response.success, message: response.message });
      }
    } catch (error) {
      console.log("error in the resendOtp controller", error);
      res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json({ success: false, message: "Internal Server Error" });
    }
  }

  async login(req: Request, res: Response): Promise<void> {
    try {
      console.log("entering the user login function in usercontroller");
      const data = req.body;
      const response = await this.userService.login(data);

      res.cookie(
        `${response.role?.toLowerCase()}_refresh_token`,
        response.refresh_token,
        {
          httpOnly: true,
          secure: true,
          sameSite: "strict",
          maxAge: 7 * 24 * 60 * 60 * 1000,
        }
      );

      console.log("response from the login controller", response);
      if (response.success) {
        res.status(response.status).json({
          success: response.success,
          message: response.message,
          data: response,
        });
      } else {
        res
          .status(response.status)
          .json({ success: response.success, message: response.message });
      }
    } catch (error) {
      console.log("error:", error);
      res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json({ success: false, message: "Internal server error" });
    }
  }

  async forgotPassword(req: Request, res: Response): Promise<void> {
    try {
      console.log("Entering forgotPassword function in userController");
      const { email } = req.body;

      const response = await this.userService.forgotPassword({ email });
      console.log("Response from forgotPassword service:", response);

      if (response.success) {
        res.status(response.status).json({
          success: response.success,
          message: response.message,
          email: response.email,
        });
      } else {
        res
          .status(response.status)
          .json({ success: response.success, message: response.message });
      }
    } catch (error) {
      console.log("Error in forgotPassword controller:", error);
      res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json({ success: false, message: "Internal Server Error" });
    }
  }

  async resetPassword(req: Request, res: Response): Promise<void> {
    try {
      console.log("Entering resetPassword function in userController");
      const { email, password } = req.body;

      const response = await this.userService.resetPassword({
        email,
        password,
      });

      console.log("Response from resetPassword service:", response);

      if (response.success) {
        res.status(response.status).json({
          success: response.success,
          message: response.message,
        });
      } else {
        res
          .status(response.status)
          .json({ success: response.success, message: response.message });
      }
    } catch (error) {
      console.log("Error in resetPassword controller:", error);
      res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json({ success: false, message: "Internal Server Error" });
    }
  }

  async logout(req: Request, res: Response): Promise<void> {
    try {
      console.log("entering the logout function from the user auth controller");
      const role = (req as any).user?.role;
      console.log("role in the user auth controller:", role);
      res.clearCookie(`${role}_refresh_token`, {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
      });
      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: "Logged out successfully",
      });
    } catch (error) {
      console.log("error occured while user logging out:", error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: true,
        message: "Internal server error occured",
      });
    }
  }

  async getAllCategories(req: Request, res: Response): Promise<void> {
    try {
      console.log("function fetching all the categories");
      const page = parseInt(req.query.page as string) || undefined;
      const limit = parseInt(req.query.limit as string) || undefined;
      const search = (req.query.search as string) || undefined;

      const result = await this.serviceService.getAllCategories({
        page,
        limit,
        search,
      });

      console.log(
        "result from the fetching all categories from the service service:",
        result
      );
      res.status(result.status).json(result);
    } catch (error) {
      console.error("Error occured while fetching the categories:", error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: "Error fetching users",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  async getAllServices(req: Request, res: Response): Promise<void> {
    try {
      console.log("services fetching to be listed in the user side");
      const page = parseInt(req.query.page as string) || undefined;
      const limit = parseInt(req.query.limit as string) || undefined;
      const search = (req.query.search as string) || undefined;
      const categoryId = req.query.category as string;

      const result = await this.serviceService.getAllServices({
        page,
        limit,
        search,
        categoryId,
      });

      console.log("result from the services fetching controller:", result);
      res.status(result.status).json(result);
    } catch (error) {
      console.log("error occured while fetching the services:", error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: "Error fetching users",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

    async getProfile(req: Request, res: Response): Promise<void> {
    try {
      console.log("Entering user profile fetch");
      const userId = (req as any).user?.id;

      if (!userId) {
        res.status(HTTP_STATUS.UNAUTHORIZED).json({
          message: "Unauthorized access",
          success: false,
          status: HTTP_STATUS.UNAUTHORIZED,
        });
        return;
      }

      const response = await this.userService.getUserProfile(
        userId
      );
      res.status(response.status).json(response);
    } catch (error) {
      console.log("Error fetching technician profile:", error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        message: "Internal Server Error",
        success: false,
        status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
      });
    }
  }
}
