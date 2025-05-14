import {
  AddCategoryResponseDTO,
  getCategoriesResponse,
  ToggleCategoryStatusResponseDTO,
  UpdatedCategoryResponseDTO,
} from "../../DTO/IServices/Iadminservices.dto/categoryManagement.dto";

export interface ICategoryManagementService {
  addCategory(name: string, imageFile: string): Promise<AddCategoryResponseDTO>;
  getAllCategories(page: number): Promise<getCategoriesResponse>;
  toggleCategoryStatus(
    categoryId: String
  ): Promise<ToggleCategoryStatusResponseDTO>;
  updateCategory(
      categoryId: string,
      updateData: { name?: string; image?: string }
    ): Promise<UpdatedCategoryResponseDTO> 
}
