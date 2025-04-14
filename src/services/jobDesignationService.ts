import { injectable, inject } from "tsyringe";
import { IjobDesignationService } from "../interfaces/Iservices/IjobDesignationService";
import { IjobDesignationRepository } from "../interfaces/Irepositories/IjobDesignationRepository";
import { AddDesignationResponseDTO } from "../interfaces/DTO/IServices/jobDesignationService.dto";
import {HTTP_STATUS} from "../utils/httpStatus";


@injectable()
export class JobDesignationService implements IjobDesignationService {
  constructor(
    @inject("IjobDesignationRepository")
    private designationRepository: IjobDesignationRepository
  ) {}

  async addDesignation(designation: string): Promise<AddDesignationResponseDTO> {
    try {
      const existing = await this.designationRepository.findByName(designation);
      if (existing) {
        return {
          status: HTTP_STATUS.CONFLICT,
          message: "Designation already exists",
        };
      }

      const newDesignation = await this.designationRepository.addDesignation(designation);
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

  async blockDesignation(id: string): Promise<AddDesignationResponseDTO> {
    try {
      const designation = await this.designationRepository.findById(id);
      if (!designation) {
        return {
          status: HTTP_STATUS.NOT_FOUND,
          message: "Designation not found",
        };
      }

      await this.designationRepository.blockDesignation(id); // set status to 'Inactive'
      return {
        status: HTTP_STATUS.OK,
        message: "Designation blocked successfully",
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
      const designations = await this.designationRepository.getAllDesignations();
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

  async findDesignationByName(name: string): Promise<AddDesignationResponseDTO> {
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
