import { IuserController } from "../../interfaces/Icontrollers/IuserController";
import { IuserService } from "../../interfaces/Iservices/IuserService";
import { Request, Response } from 'express'
import { HTTP_STATUS } from "../../utils/httpStatus";

export class UserController implements IuserController {
    userService: IuserService
    constructor(userService: IuserService) {
        this.userService = userService
    }
    async register(req: Request, res: Response): Promise<void> {
        try {
            console.log("entering to the register function in userController");
            const data = req.body;
            console.log("data:", data);
            const response = await this.userService.userSignUp(data)
            console.log('response in register:', response);
            if (response.success) {
                res.status(HTTP_STATUS.CREATED).json({ success: true, message: response.message, email: response.email, tempUserId: response.tempUserId })
            } else {
                res.status(HTTP_STATUS.BAD_REQUEST).json({ success: false, message: response.message })
            }
        } catch (error) {
            console.log("error occured", error);
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ success: false, message: "Internal Server Error" })
        }
    }

    async verifyOtp(req: Request, res: Response): Promise<void> {
        try {
            console.log("entering into the verify otp function in userController");
            const data = req.body;
            console.log("data:", data);
            const response = await this.userService.verifyOtp(data);
            if (response.success) {
                res.status(HTTP_STATUS.CREATED).json({ success: true, message: response.message, data: response });
            } else {
                res.status(HTTP_STATUS.BAD_REQUEST).json({ success: false, message: response.message })
            }
        } catch (error) {
            console.log("error occured:", error);
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ success: false, message: "Internal Server Error" });
        }
    }

    async login(req: Request, res: Response): Promise<void> {
        try {
            console.log("entering the user login function in usercontroller");
            const data = req.body;
            const response = await this.userService.login(data);
            console.log("response from the login controller", response);
            if (response.success) {
                res.status(HTTP_STATUS.OK).json({ success: true, message: response.message, data: response });
            } else {
                res.status(HTTP_STATUS.BAD_REQUEST).json({ success: false, message: response.message })
            }
        } catch (error) {
            console.log("error:", error);
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ success: false, message: "Internal server error" })
        }
    }
}