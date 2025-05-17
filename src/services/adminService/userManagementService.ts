import { inject, injectable } from "tsyringe";
import { IuserRepository } from "../../interfaces/Irepositories/IuserRepository";
import { HTTP_STATUS } from "../../utils/httpStatus";
import {
  PaginatedUserResponse,
  ToggleUserStatusResponse,
} from "../../interfaces/DTO/IServices/Iadminservices.dto/userManagement.dto";
import { IuserManagementService } from "../../interfaces/Iservices/IadminService/IuserManagementService";
import { Iuser } from "../../interfaces/Models/Iuser";

@injectable()
export class UserManagementService implements IuserManagementService {
  constructor(
    @inject("IuserRepository") private userRepository: IuserRepository
  ) {}

  async getAllUsers(options: {
    page?: number;
    limit?: number;
    search?: string;
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
  }> {
    try {
      console.log("Function fetching all the users");
      const page = options.page || 1;
      const limit = options.limit || 5;
      const result = await this.userRepository.getAllUsers({
        page,
        limit,
        search:options.search
    });

      console.log("result from the usermanagement service:", result);

      return {
        success: true,
        status: HTTP_STATUS.OK,
        message: "Users fetched successfully",
        data: {
          users: result.data,
          pagination: {
            total: result.total,
            page: result.page,
            pages: result.pages,
            limit: limit,
            hasNextPage: result.page < result.pages,
            hasPrevPage: page > 1,
          },
        },
      };
    } catch (error) {
      console.error("Error fetching users:", error);
      return {
        success: false,
        status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
        message: "Something went wrong while fetching users",
      };
    }
  }

  async toggleUserStatus(id: string): Promise<ToggleUserStatusResponse> {
    try {
      const user = await this.userRepository.findById(id);
      console.log("User fetched from repository:", user);

      if (!user) {
        return {
          message: "User not found",
        };
      }

      const newStatus = !user.status;
      let response = await this.userRepository.blockUser(id, newStatus);
      console.log(
        "Response after toggling user status from the user repository:",
        response
      );

      return {
        message: `User successfully ${newStatus ? "unblocked" : "blocked"}`,
        user: { ...user.toObject(), status: newStatus },
      };
    } catch (error) {
      console.error("Error toggling user status:", error);
      return {
        message: "Failed to toggle user status",
      };
    }
  }
}
