import { Iadmin } from "../../Models/Iadmin";

export interface loginResponseDTO {
  success: boolean;
  status: number;
  message: string;
  data?:Iadmin;
  role?: string;
  access_token?: string;
  refresh_token?: string;
}

export interface loginDataDTO {
  email: string;
  password: string;
}
