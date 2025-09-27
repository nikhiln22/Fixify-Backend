import { inject, injectable } from "tsyringe";
import { IPartService } from "../interfaces/Iservices/IpartService";
import {
  AddPart,
  AddPartResponse,
  TogglePartStatusResponse,
  UpdatePart,
  UpdatePartResponse,
} from "../interfaces/DTO/IServices/IpartService";
import { IPartsRepository } from "../interfaces/Irepositories/IpartRepository";
import { IPart } from "../interfaces/Models/Ipart";

@injectable()
export class PartsService implements IPartService {
  constructor(
    @inject("IPartsRepository") private _partsRepository: IPartsRepository
  ) {}

  async addPart(
    data: AddPart
  ): Promise<{ message: string; success: boolean; data?: AddPartResponse }> {
    try {
      console.log("entering the addPart function in the part service");

      const newPart = await this._partsRepository.addPart(data);

      if (!newPart) {
        return {
          success: false,
          message: "Failed to create part",
        };
      }

      console.log("newly added part:", newPart);

      const populatedPart = newPart as unknown as AddPartResponse;

      const addedPart: AddPartResponse = {
        _id: populatedPart._id,
        name: populatedPart.name,
        description: populatedPart.description,
        price: populatedPart.price,
        services: populatedPart.services,
        status: populatedPart.status,
      };

      return {
        success: true,
        message: "New Part added successfully",
        data: addedPart,
      };
    } catch (error) {
      console.log("error occurred while adding the part", error);
      return {
        success: false,
        message: "something went wrong while adding the part",
      };
    }
  }

  async getAllParts(options: {
    page?: number;
    limit?: number;
    search?: string;
    serviceId?: string;
    status?: string;
  }): Promise<{
    success: boolean;
    message: string;
    data?: {
      parts: IPart[];
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
      console.log("Function fetching all the Parts");

      const page = options.page;
      const limit = options.limit;

      const result = await this._partsRepository.getAllParts({
        page,
        limit,
        search: options.search,
        serviceId: options.serviceId,
        status: options.status,
      });

      console.log("result from the Partsmanagement service:", result);

      return {
        success: true,
        message: "Parts fetched successfully",
        data: {
          parts: result.data,
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
      console.error("Error fetching parts:", error);
      return {
        success: false,
        message: "Something went wrong while fetching parts",
      };
    }
  }

  async togglePartStatus(partId: string): Promise<TogglePartStatusResponse> {
    try {
      console.log("toggling the status of the part:", partId);
      const part = await this._partsRepository.findPartById(partId);

      if (!part) {
        return {
          success: false,
          message: "Part not found",
        };
      }

      const newStatus = part.status === "Active" ? "Blocked" : "Active";

      const updatedPart = await this._partsRepository.updatePartStatus(
        partId,
        newStatus
      );

      if (!updatedPart) {
        return {
          success: false,
          message: "Failed to update part",
        };
      }

      console.log(
        "Response after toggling part status from the part repository:",
        updatedPart
      );

      return {
        success: true,
        message: `${part.name} successfully ${
          newStatus === "Active" ? "UnBlocked" : "Blocked"
        }`,
        data: updatedPart,
      };
    } catch (error) {
      console.error("Error toggling part status:", error);
      return {
        success: false,
        message: "Failed to toggle part status",
      };
    }
  }

  async updatePart(
    partId: string,
    data: UpdatePart
  ): Promise<{ message: string; success: boolean; data?: UpdatePartResponse }> {
    try {
      console.log("entering the updatePart function in the part service");
      console.log("partId:", partId, "update data:", data);

      const existingPart = await this._partsRepository.findPartById(partId);
      if (!existingPart) {
        return {
          success: false,
          message: "Part not found",
        };
      }

      const updatedPart = await this._partsRepository.updatePart(partId, data);

      if (!updatedPart) {
        return {
          success: false,
          message: "Failed to update part",
        };
      }

      console.log("updated part:", updatedPart);

      const populatedPart = updatedPart as unknown as UpdatePartResponse;

      const responseData: UpdatePartResponse = {
        _id: populatedPart._id,
        name: populatedPart.name,
        description: populatedPart.description,
        price: populatedPart.price,
        services: populatedPart.services,
      };

      return {
        success: true,
        message: "Part updated successfully",
        data: responseData,
      };
    } catch (error) {
      console.log("error occurred while updating the part", error);
      return {
        success: false,
        message: "Something went wrong while updating the part",
      };
    }
  }
}
