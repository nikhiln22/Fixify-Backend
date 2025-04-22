import {
  PaginatedUserResponse,
  ToggleUserStatusResponse,
} from "../DTO/IServices/userManagement.dto";


export interface IuserManagementService {
  getPaginatedUsers(page: number): Promise<PaginatedUserResponse>;
  toggleUserStatus(id: string): Promise<ToggleUserStatusResponse>;
}
