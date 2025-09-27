import {
  AddPart,
  AddPartResponse,
  TogglePartStatusResponse,
  UpdatePart,
  UpdatePartResponse,
} from "../DTO/IServices/IpartService";
import { IPart } from "../Models/Ipart";

export interface IPartService {
  addPart(data: AddPart): Promise<{
    message: string;
    success: boolean;
    data?: AddPartResponse;
  }>;
  getAllParts(options: {
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
  }>;
  togglePartStatus(categoryId: string): Promise<TogglePartStatusResponse>;
  updatePart(
    partId: string,
    data: UpdatePart
  ): Promise<{ message: string; success: boolean; data?: UpdatePartResponse }>;
}
