import { loginResponseDTO } from "../DTO/IServices/adminService.dto";
import { loginDataDTO } from "../DTO/IServices/adminService.dto";

export interface IadminService{
    adminLogin(data:loginDataDTO):Promise<loginResponseDTO>
}