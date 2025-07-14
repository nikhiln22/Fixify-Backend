import { Iadmin } from "../../Models/Iadmin";

export interface loginResponse {
  success: boolean;
  message: string;
  data?: Iadmin;
  role?: string;
  access_token?: string;
  refresh_token?: string;
}

export interface loginData {
  email: string;
  password: string;
}
