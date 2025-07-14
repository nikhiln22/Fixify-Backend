import { IService } from "../../Models/Iservice";
import { Icategory } from "../../Models/Icategory";

export interface ServiceData {
  name: string;
  price: number;
  description: string;
  categoryId: string;
  designationId: string;
  imageFile?: string;
  serviceId?: string;
}

export interface AddServiceResponse {
  success: boolean;
  message: string;
  data?: IService;
}

export interface ToggleServiceStatusResponse {
  success: boolean;
  message: string;
  data?: IService;
}

export interface UpdatedServiceResponse {
  success: boolean;
  message: string;
  data?: IService;
}

export interface AddCategoryResponse {
  success: boolean;
  message: string;
  data?: Icategory;
}

export interface getCategoriesResponse {
  message: string;
  categories?: Icategory[];
  total?: number;
  totalPages?: number;
}

export interface ToggleCategoryStatusResponse {
  success: boolean;
  message: string;
  data?: Icategory;
}

export interface UpdatedCategoryResponse {
  success: boolean;
  message: string;
  data?: Icategory;
}

export interface getServiceDetailsResponse {
  success: boolean;
  message: string;
  data?: {
    service: IService;
    relatedService: IService[];
  };
}
