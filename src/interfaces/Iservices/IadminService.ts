import { loginResponse } from "../DTO/IServices/IadminService";
import { loginData } from "../DTO/IServices/IadminService";

export interface IadminService{
    adminLogin(data:loginData):Promise<loginResponse>
}