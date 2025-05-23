import { injectable, inject } from "tsyringe";
import { Roles } from "../config/roles";
import {
  loginData,
  loginResponse,
} from "../interfaces/DTO/IServices/IadminService";
import { IadminRepository } from "../interfaces/Irepositories/IadminRepository";
import { IadminService } from "../interfaces/Iservices/IadminService";
import { HTTP_STATUS } from "../utils/httpStatus";
import { IjwtService } from "../interfaces/Ijwt/Ijwt";
import { IPasswordHasher } from "../interfaces/IpasswordHasher/IpasswordHasher";


@injectable()
export class AdminService implements IadminService {
  constructor(
    @inject("IadminRepository") private adminRepository: IadminRepository,
    @inject("IPasswordHasher") private passwordService: IPasswordHasher,
    @inject("IjwtService") private jwtService: IjwtService
  ) {}

  async adminLogin(data: loginData): Promise<loginResponse> {
    try {
      console.log(
        "entered into the adminLogin function in the adminAuthService"
      );
      console.log("data in adminLogin service:", data);

      const { email, password } = data;

      const admin = await this.adminRepository.findByEmail(email);

      console.log("admin from the adminAuthService:", admin);

      if (!admin.success || !admin.adminData) {
        return {
          success: false,
          message: "admin not found",
          status: HTTP_STATUS.NOT_FOUND,
        };
      }

      const isPasswordValid = await this.passwordService.verify(
        admin.adminData.password,
        password
      );
      if (!isPasswordValid) {
        return {
          success: false,
          message: "invalid Password",
          status: HTTP_STATUS.NOT_FOUND,
        };
      }

      const adminId = String(admin.adminData._id);

      const safeAdminData = admin.adminData.toJSON
        ? admin.adminData.toJSON()
        : JSON.parse(JSON.stringify(admin.adminData));

      console.log("safeAdminData:", safeAdminData);

      delete safeAdminData.password;

      const access_token = await this.jwtService.generateAccessToken(
        adminId,
        Roles.ADMIN
      );
      console.log("admin access_token:", access_token);

      const refresh_token = await this.jwtService.generateRefreshToken(
        adminId,
        Roles.ADMIN
      );
      console.log("admin refresh_token:", refresh_token);

      return {
        success: true,
        message: "Login Successful",
        access_token,
        refresh_token,
        role: Roles.ADMIN,
        status: HTTP_STATUS.OK,
        data: safeAdminData,
      };
    } catch (error) {
      console.log("error occured while admin is logging in:", error);
      return {
        success: false,
        message: "error occured during the adminLogin",
        status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
      };
    }
  }
}
