import { injectable, inject } from "tsyringe";
import { Roles } from "../config/roles";
import {
  LoginData,
  LoginResponse,
} from "../interfaces/DTO/IServices/IadminService";
import { IAdminRepository } from "../interfaces/Irepositories/IadminRepository";
import { IAdminService } from "../interfaces/Iservices/IadminService";
import { IJwtService } from "../interfaces/Ijwt/Ijwt";
import { IPasswordHasher } from "../interfaces/IpasswordHasher/IpasswordHasher";

@injectable()
export class AdminService implements IAdminService {
  constructor(
    @inject("IAdminRepository") private _adminRepository: IAdminRepository,
    @inject("IPasswordHasher") private _passwordService: IPasswordHasher,
    @inject("IJwtService") private _jwtService: IJwtService
  ) {}

  async adminLogin(data: LoginData): Promise<LoginResponse> {
    try {
      console.log("entered into the adminLogin function in the admin Service");
      console.log("data in adminLogin service:", data);

      const { email, password } = data;

      const admin = await this._adminRepository.findByEmail(email);

      console.log("admin from the adminAuthService:", admin);

      if (!admin) {
        return {
          success: false,
          message: "admin not found",
        };
      }

      const isPasswordValid = await this._passwordService.verify(
        admin.password,
        password
      );
      if (!isPasswordValid) {
        return {
          success: false,
          message: "invalid Password",
        };
      }

      const adminId = String(admin._id);

      const access_token = await this._jwtService.generateAccessToken(
        adminId,
        Roles.ADMIN
      );
      console.log("admin access_token:", access_token);

      const refresh_token = await this._jwtService.generateRefreshToken(
        adminId,
        Roles.ADMIN
      );
      console.log("admin refresh_token:", refresh_token);

      return {
        success: true,
        message: "Login Successful",
        access_token,
        refresh_token,
        data: {
          _id: admin._id,
          email: admin.email,
          status: admin.status,
        },
      };
    } catch (error) {
      console.log("error occured while admin is logging in:", error);
      return {
        success: false,
        message: "error occured during the adminLogin",
      };
    }
  }
}
