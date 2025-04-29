import { loginResponseDTO } from "../../DTO/IServices/Iadminservices.dto/adminAuthService.dto";
import { loginDataDTO } from "../../DTO/IServices/Iadminservices.dto/adminAuthService.dto";

export interface IadminService{
    adminLogin(data:loginDataDTO):Promise<loginResponseDTO>
}