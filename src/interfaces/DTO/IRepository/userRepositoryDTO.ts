import { Iuser } from "../../Models/Iuser";
import { ItempUser } from "../../Models/ItempUser";

export interface findByEmailResponseDTO {
    success: boolean;
    userData?: Iuser;
}

export interface createTempUserResponseDTO {
    success: boolean;
    tempUserId: String;
}

export interface findTempUserByIdDTO {
    success: boolean;
    tempUserData?: ItempUser;
    message?:string;
}

export interface createUserDTO{
    username:string;
    email:string;
    phone:number;
    password:string
}