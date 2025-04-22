import { injectable, inject } from "tsyringe";
import { IjobDesignationService } from "../../interfaces/Iservices/IjobDesignationService";
import { IjobDesignationRepository } from "../../interfaces/Irepositories/IjobDesignationRepository";
import { AddDesignationResponseDTO } from "../../interfaces/DTO/IServices/jobDesignationService.dto";
import { HTTP_STATUS } from "../../utils/httpStatus";

@injectable()
export class JobDesignationService implements IjobDesignationService {
  constructor(
    @inject("IjobDesignationRepository")
    private designationRepository: IjobDesignationRepository
  ) {}

  async addDesignation(
    designation: string
  ): Promise<AddDesignationResponseDTO> {
    try {
      const existing = await this.designationRepository.findByName(designation);
      if (existing) {
        return {
          status: HTTP_STATUS.CONFLICT,
          message: "Designation already exists",
        };
      }

      const newDesignation = await this.designationRepository.addDesignation(
        designation
      );
      console.log("added new designation from the service:", newDesignation);
      return {
        status: HTTP_STATUS.CREATED,
        message: "Designation added successfully",
        designation: newDesignation,
      };
    } catch (error) {
      console.error("Error adding designation:", error);
      return {
        status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
        message: "Something went wrong while adding designation",
      };
    }
  }

  async toggleDesignationStatus(id: string): Promise<AddDesignationResponseDTO> {
    try {
      const designation = await this.designationRepository.findById(id);
      console.log(
        "desigantion from the block designation service:",
        designation
      );
      if (!designation) {
        return {
          status: HTTP_STATUS.NOT_FOUND,
          message: "Designation not found",
        };
      }

      const newStatus = !designation.Status;

      let response = await this.designationRepository.blockDesignation(id,newStatus);
      console.log(
        "response after blocking the job designation from the designation repository:",
        response
      );
      return {
        status: HTTP_STATUS.OK,
        message: `Designation successfully ${newStatus ? "unblocked" : "blocked"}`,
        designation: { ...designation.toObject(), Status: newStatus }
      };
    } catch (error) {
      console.error("Error blocking designation:", error);
      return {
        status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
        message: "Failed to block designation",
      };
    }
  }

  async getAllDesignations(): Promise<AddDesignationResponseDTO> {
    try {
      const designations =
        await this.designationRepository.getAllDesignations();
      return {
        status: HTTP_STATUS.OK,
        message: "Designations fetched successfully",
        designation: designations,
      };
    } catch (error) {
      console.error("Error fetching designations:", error);
      return {
        status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
        message: "Failed to fetch designations",
      };
    }
  }

  async getPaginatedDesignations(
    page: number
  ): Promise<AddDesignationResponseDTO> {
    const limit = 10;

    try {
      const result = await this.designationRepository.getPaginatedDesignations(
        page,
        limit
      );
      const totalPages = Math.ceil(result.total / limit);

      return {
        status: HTTP_STATUS.OK,
        message: "Designations fetched successfully",
        designation: result.data,
        total: result.total,
        totalPages,
      };
    } catch (error) {
      console.error("Error fetching paginated designations:", error);
      return {
        status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
        message: "Failed to fetch paginated designations",
      };
    }
  }

  async findDesignationByName(
    name: string
  ): Promise<AddDesignationResponseDTO> {
    try {
      const designation = await this.designationRepository.findByName(name);
      if (!designation) {
        return {
          status: HTTP_STATUS.NOT_FOUND,
          message: "Designation not found",
        };
      }

      return {
        status: HTTP_STATUS.OK,
        message: "Designation found",
        designation,
      };
    } catch (error) {
      console.error("Error finding designation:", error);
      return {
        status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
        message: "Failed to find designation",
      };
    }
  }
}
