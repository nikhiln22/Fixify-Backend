import { IService } from "../../Models/Iservice";
import { ICategory } from "../../Models/Icategory";

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
  data?: {
    _id: string;
    status: string;
  };
}

export interface UpdatedServiceResponse {
  success: boolean;
  message: string;
  data?: IService;
}

export interface AddCategoryResponse {
  success: boolean;
  message: string;
  data?: ICategory;
}

export interface GetCategoriesResponse {
  message: string;
  categories?: ICategory[];
  total?: number;
  totalPages?: number;
}

export interface ToggleCategoryStatusResponse {
  success: boolean;
  message: string;
  data?: {
    _id: string;
    status: string;
  };
}

export interface UpdatedCategoryResponse {
  success: boolean;
  message: string;
  data?: ICategory;
}

export interface GetServiceDetailsResponse {
  success: boolean;
  message: string;
  data?: {
    service: IService;
    relatedService: IService[];
  };
}
