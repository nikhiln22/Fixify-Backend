import { injectable, inject } from "tsyringe";
import { IJobsService } from "../interfaces/Iservices/IjobsService";
import { IJobDesignationRepository } from "../interfaces/Irepositories/IjobDesignationRepository";
import {
  DesignationResponse,
  ToggleDesignationResponse,
} from "../interfaces/DTO/IServices/IjobService";
import { IJobDesignation } from "../interfaces/Models/IjobDesignation";

@injectable()
export class JobService implements IJobsService {
  constructor(
    @inject("IJobDesignationRepository")
    private _designationRepository: IJobDesignationRepository
  ) {}

  async addDesignation(designation: string): Promise<DesignationResponse> {
    try {
      const existing = await this._designationRepository.findByName(
        designation
      );
      if (existing) {
        return {
          success: false,
          message: "Designation already exists",
        };
      }

      const newDesignation = await this._designationRepository.addDesignation(
        designation
      );
      console.log("added new designation from the service:", newDesignation);
      return {
        success: true,
        message: "Designation added successfully",
        data: newDesignation,
      };
    } catch (error) {
      console.error("Error adding designation:", error);
      return {
        success: false,
        message: "Something went wrong while adding designation",
      };
    }
  }

  async toggleDesignationStatus(
    id: string
  ): Promise<ToggleDesignationResponse> {
    try {
      const designation = await this._designationRepository.findById(id);
      console.log(
        "desigantion from the block designation service:",
        designation
      );
      if (!designation) {
        return {
          success: false,
          message: "Designation not found",
        };
      }

      const newStatus = designation.status === "Active" ? "Blocked" : "Active";

      const updatedDesignation =
        await this._designationRepository.blockDesignation(id, newStatus);

      if (!updatedDesignation) {
        return {
          success: false,
          message: "Failed to update designation",
        };
      }

      return {
        success: true,
        message: `Designation ${newStatus.toLowerCase()} successfully`,
        data: {
          designationId: updatedDesignation._id,
          status: updatedDesignation.status,
        },
      };
    } catch (error) {
      console.error("Error blocking designation:", error);
      return {
        success: false,
        message: "Failed to block designation",
      };
    }
  }

  async getAllDesignations(options: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
  }): Promise<{
    success: boolean;
    message: string;
    data?: {
      designations: IJobDesignation[];
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
      console.log("Function fetching all designations");
      const page = options.page;
      const limit = options.limit;

      const result = await this._designationRepository.getAllDesignations({
        page,
        limit,
        search: options.search,
        status: options.status,
      });

      console.log("result from the designation service:", result);

      return {
        success: true,
        message: "Designations fetched successfully",
        data: {
          designations: result.data,
          pagination: {
            total: result.total,
            page: result.page,
            pages: result.pages,
            limit: result.limit,
            hasNextPage: result.page < result.pages,
            hasPrevPage: result.page > 1,
          },
        },
      };
    } catch (error) {
      console.error("Error fetching designations:", error);
      return {
        success: false,
        message: "Something went wrong while fetching designations",
      };
    }
  }
}
