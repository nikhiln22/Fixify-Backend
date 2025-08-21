import { LoginResponse } from "../DTO/IServices/IadminService";
import { LoginData } from "../DTO/IServices/IadminService";

export interface IAdminService {
  adminLogin(data: LoginData): Promise<LoginResponse>;
}
