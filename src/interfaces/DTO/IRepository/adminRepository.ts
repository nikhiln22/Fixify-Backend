import { IAdmin } from "../../Models/Iadmin";

export interface FindByEmailResponse {
  success: boolean;
  adminData?: IAdmin;
}
