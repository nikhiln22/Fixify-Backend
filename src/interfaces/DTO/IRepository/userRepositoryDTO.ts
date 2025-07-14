import { Iuser } from "../../Models/Iuser";
import { ItempUser } from "../../Models/ItempUser";

export interface findByEmailResponseDTO {
  success: boolean;
  userData?: Iuser;
}

export interface createTempUserResponseDTO {
  success: boolean;
  tempUserId: string;
}

export interface findTempUserByIdDTO {
  success: boolean;
  tempUserData?: ItempUser;
  message?: string;
}

export interface createUserDTO {
  username: string;
  email: string;
  phone: number;
  password: string;
}

export interface findTempUserByEmailDTO {
  success: boolean;
  tempUserData?: ItempUser;
  message?: string;
}

export interface updateTempUserDTO {
  success: boolean;
  message: string;
}

export interface UpdatePasswordResponseDTO {
  success: boolean;
  message?: string;
}
