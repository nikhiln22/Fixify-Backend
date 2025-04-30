import { ItechnicianAuthController } from "../../interfaces/Icontrollers/Itechniciancontrollers/ItechnicianAuthController";
import { ItechnicianAuthService } from "../../interfaces/Iservices/ItechnicianService/ItechnicianAuthService";
import { Request, Response } from "express";
import { HTTP_STATUS } from "../../utils/httpStatus";
import { inject, injectable } from "tsyringe";

@injectable()
export class TechnicianAuthController implements ItechnicianAuthController {
  constructor(
    @inject("ItechnicianAuthService")
    private technicianAuthService: ItechnicianAuthService
  ) {}

  async register(req: Request, res: Response): Promise<void> {
    try {
      console.log(
        "entering to the register function in technicianAuthController"
      );
      const data = req.body;
      console.log("data:", data);
      const response = await this.technicianAuthService.technicianSignUp(data);
      console.log("response in technician register:", response);
      if (response.success) {
        res.status(response.status).json({
          success: response.success,
          message: response.message,
          email: response.email,
          tempTechnicianId: response.tempTechnicianId,
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
      console.log(
        "entering into the verify otp function in technicianAuthController"
      );
      const data = req.body;
      console.log("technicianData in verifyOtp controller:", data);
      const response = await this.technicianAuthService.verifyOtp(data);
      console.log("response in verifyOtp controller in technician:", response);
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
      console.log(
        "entering into the resend otp functionality in the technicianAuthController"
      );
      const { email } = req.body;
      const response = await this.technicianAuthService.resendOtp(email);
      console.log(
        "response from the technician resendotp controller:",
        response
      );
      if (response.success) {
        res.status(response.status).json({
          success: response.success,
          message: response.message,
          email: response.email,
          tempTechnicianId: response.tempTechnicianId,
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
      console.log(
        "entering the user login function in technicianAuthController"
      );
      const data = req.body;
      const response = await this.technicianAuthService.login(data);
      console.log("response from the technician login controller", response);

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

      if (response.success) {
        res
          .status(response.status)
          .json({
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
      console.log(
        "Entering forgotPassword function in technicianAuthController"
      );
      const { email } = req.body;

      const response = await this.technicianAuthService.forgotPassword({
        email,
      });
      console.log(
        "Response from forgotPassword service in technician:",
        response
      );

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
      console.log(
        "Entering resetPassword function in technicianAuthController"
      );
      const { email, password } = req.body;

      const response = await this.technicianAuthService.resetPassword({
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
      console.log("entering the logout function from the technician auth controller");
      const role = (req as any).user?.role;
      console.log("role in the technician auth controller:", role);
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
      console.log("error occured while technician logging out:", error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: true,
        message: "Internal server error occured",
      });
    }
  }
}
