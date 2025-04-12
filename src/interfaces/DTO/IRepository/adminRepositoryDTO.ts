import { Iadmin } from "../../Models/Iadmin";

export interface findByEmailResponseDTO {
  success: boolean;
  adminData?: Iadmin;
}
