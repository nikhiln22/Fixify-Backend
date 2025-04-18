import { IuserController } from "../../interfaces/Icontrollers/IuserController";
import { IuserService } from "../../interfaces/Iservices/IuserService";
import { Request, Response } from "express";
import { HTTP_STATUS } from "../../utils/httpStatus";

export class UserController implements IuserController {
  constructor(private userService: IuserService) {}

  async register(req: Request, res: Response): Promise<void> {
    try {
      console.log("entering to the register function in userController");
      const data = req.body;
      console.log("data:", data);
      const response = await this.userService.userSignUp(data);
      console.log("response in register:", response);
      if (response.success) {
        res.status(HTTP_STATUS.CREATED).json({
          success: true,
          message: response.message,
          email: response.email,
          tempUserId: response.tempUserId,
        });
      } else {
        res
          .status(HTTP_STATUS.BAD_REQUEST)
          .json({ success: false, message: response.message });
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
        res.status(HTTP_STATUS.CREATED).json(response);
      } else {
        res
          .status(HTTP_STATUS.BAD_REQUEST)
          .json({ success: false, message: response.message });
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
        res.status(HTTP_STATUS.OK).json({
          success: true,
          message: response.message,
          email: response.email,
          tempuserId: response.tempUserId,
        });
      } else {
        res
          .status(HTTP_STATUS.BAD_REQUEST)
          .json({ success: false, message: response.message });
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
      console.log("response from the login controller", response);
      if (response.success) {
        res
          .status(HTTP_STATUS.OK)
          .json({ success: true, message: response.message, data: response });
      } else {
        res
          .status(HTTP_STATUS.BAD_REQUEST)
          .json({ success: false, message: response.message });
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

      if (!email) {
        res
          .status(HTTP_STATUS.BAD_REQUEST)
          .json({ success: false, message: "Email is required" });
        return;
      }

      const response = await this.userService.forgotPassword({ email });
      console.log("Response from forgotPassword service:", response);

      if (response.success) {
        res.status(HTTP_STATUS.OK).json({
          success: true,
          message: response.message,
          email: response.email,
        });
      } else {
        res
          .status(response.status || HTTP_STATUS.BAD_REQUEST)
          .json({ success: false, message: response.message });
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

      
      if (!email && !password) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: "Email and new password are required",
        });
        return;
      }
      
      const response = await this.userService.resetPassword({
        email,
        password,
      });
      
      console.log("Response from resetPassword service:", response);
      
      if (response.success) {
        res.status(HTTP_STATUS.OK).json({
          success: true,
          message: response.message,
        });
      } else {
        res
          .status(response.status || HTTP_STATUS.BAD_REQUEST)
          .json({ success: false, message: response.message });
      }
    } catch (error) {
      console.log("Error in resetPassword controller:", error);
      res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json({ success: false, message: "Internal Server Error" });
    }
  }
}