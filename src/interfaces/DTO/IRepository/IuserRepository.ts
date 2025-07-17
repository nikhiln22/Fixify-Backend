import { IUser } from "../../Models/Iuser";
import { ITempUser } from "../../Models/ItempUser";

export interface FindByEmailResponse {
  success: boolean;
  userData?: IUser;
}

export interface CreateTempUserResponse {
  success: boolean;
  tempUserId: string;
}

export interface FindTempUserById {
  success: boolean;
  tempUserData?: ITempUser;
  message?: string;
}

export interface CreateUser {
  username: string;
  email: string;
  phone: number;
  password: string;
}

export interface FindTempUserByEmail {
  success: boolean;
  tempUserData?: ITempUser;
  message?: string;
}

export interface UpdateTempUser {
  success: boolean;
  message: string;
}

export interface UpdatePasswordResponse {
  success: boolean;
  message?: string;
}
