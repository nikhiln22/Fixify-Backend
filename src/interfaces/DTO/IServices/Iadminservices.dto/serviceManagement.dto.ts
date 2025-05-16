import { IService } from "../../../Models/Iservice";

export interface ServiceData {
  name: string;
  price: number;
  description: string;
  categoryId: string;
  imageFile?: string;
  serviceId?: string;
}

export interface AddServiceResponseDTO {
  success: boolean;
  status: number;
  message: string;
  data?: IService;
}
