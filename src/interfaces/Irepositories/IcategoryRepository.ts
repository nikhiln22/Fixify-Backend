import { ICategory } from "../../interfaces/Models/Icategory";

export interface ICategoryRepository {
  addCategory(name: string, image: string): Promise<ICategory>;
  findCategoryByName(name: string): Promise<ICategory | null>;
  getAllCategories(options: {
    page?: number;
    limit?: number;
    search?: string;
    categoryId?: string;
    status?: string;
  }): Promise<{
    data: ICategory[];
    total: number;
    page: number;
    limit: number;
    pages: number;
  }>;
  findCategoryById(id: string): Promise<ICategory | null>;
  updateCategoryStatus(
    categoryId: string,
    newStatus: boolean
  ): Promise<ICategory | null>;

  updateCategory(
    id: string,
    updateData: { name?: string; image?: string }
  ): Promise<ICategory | null>;
}
