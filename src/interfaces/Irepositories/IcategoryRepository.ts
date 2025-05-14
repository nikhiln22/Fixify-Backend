import { Icategory } from "../Models/Icategory";

export interface ICategoryRepository {
  addCategory(name: string, image: string): Promise<Icategory>;
  findCategoryByName(name: string): Promise<Icategory | null>;
  getAllCategories(
    page: number,
    limit: number
  ): Promise<{
    data: Icategory[];
    total: number;
  }>;
  findCategoryById(id: string): Promise<Icategory | null>;
  updateCategoryStatus(
    categoryId: string,
    newStatus: boolean
  ): Promise<Icategory | null>;

  updateCategory(
    id: string,
    updateData: { name?: string; image?: string }
  ): Promise<Icategory | null>;
}
