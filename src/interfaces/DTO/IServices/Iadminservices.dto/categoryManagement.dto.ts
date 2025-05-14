import { Icategory } from "../../../Models/Icategory";

export interface AddCategoryResponseDTO {
  success: boolean;
  status: number;
  message: string;
  data?: Icategory;
}

export interface getCategoriesResponse {
  status: number;
  message: string;
  categories?: Icategory[];
  total?: number;
  totalPages?: number;
}

export interface ToggleCategoryStatusResponseDTO {
  status: number;
  success: boolean;
  message: string;
  data?: Icategory;
}

export interface UpdatedCategoryResponseDTO {
  status: number;
  success: boolean;
  message: string;
  data?: Icategory;
}