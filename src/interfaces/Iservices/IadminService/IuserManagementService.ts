import {
  PaginatedUserResponse,
  ToggleUserStatusResponse,
} from "../../DTO/IServices/Iadminservices.dto/userManagement.dto";
import { Iuser } from "../../Models/Iuser";

export interface IuserManagementService {
  getAllUsers(options: {
    page?: number;
    limit?: number;
    search?: string;
    categoryId?: string;
  }): Promise<{
    success: boolean;
    status: number;
    message: string;
    data?: {
      users: Iuser[];
      pagination: {
        total: number;
        page: number;
        pages: number;
        limit: number;
        hasNextPage: boolean;
        hasPrevPage: boolean;
      };
    };
  }>;
  toggleUserStatus(id: string): Promise<ToggleUserStatusResponse>;
}
