import { IAdmin } from "../../Models/Iadmin";

export interface LoginResponse {
  success: boolean;
  message: string;
  data?: IAdmin;
  role?: string;
  access_token?: string;
  refresh_token?: string;
}

export interface LoginData {
  email: string;
  password: string;
}
