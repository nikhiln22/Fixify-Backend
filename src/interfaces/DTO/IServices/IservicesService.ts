import { IService } from "../../Models/Iservice";
import { Icategory } from "../../Models/Icategory";

export interface ServiceData {
  name: string;
  price: number;
  description: string;
  categoryId: string;
  imageFile?: string;
  serviceId?: string;
}

export interface AddServiceResponse {
  success: boolean;
  status: number;
  message: string;
  data?: IService;
}

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