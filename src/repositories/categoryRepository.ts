import { Icategory } from "../interfaces/Models/Icategory";
import { BaseRepository } from "./baseRepository";
import { injectable } from "tsyringe";
import category from "../models/categoryModel";
import { ICategoryRepository } from "../interfaces/Irepositories/IcategoryRepository";

@injectable()
export class CategoryRepository
  extends BaseRepository<Icategory>
  implements ICategoryRepository
{
  constructor() {
    super(category);
  }

  async addCategory(name: string, image: string): Promise<Icategory> {
    try {
      console.log("adding the categories by the admin into the database");
      const newCategory = await this.create({ name, image });
      return newCategory;
    } catch (error) {
      console.log("error occured while adding the category", error);
      throw new Error("failed to add the new Category");
    }
  }

  async findCategoryByName(name: string): Promise<Icategory | null> {
    try {
      console.log("Checking if category already exists...");
      return await this.findOne({ name });
    } catch (error) {
      console.error("Error occurred while finding the category:", error);
      throw new Error("Failed to find category by name");
    }
  }

  async getAllCategories(
    page: number,
    limit: number
  ): Promise<{ data: Icategory[]; total: number }> {
    try {
      console.log("getting all the categories from the data base");

      const categories = await this.find(
        {},
        {
          pagination: { page, limit },
          sort: { createdAt: -1 },
        }
      );

      console.log("categories:", categories);
      return categories as { data: Icategory[]; total: number };
    } catch (error) {
      console.log("Error occured with the fetchning the categories:", error);
      throw new Error("An error occurred while retrieving the categories");
    }
  }

  async findCategoryById(id: string): Promise<Icategory | null> {
    try {
      return await this.findById(id);
    } catch (error) {
      throw new Error("Error finding category by ID: " + error);
    }
  }

  async updateCategoryStatus(
    categoryId: string,
    newStatus: boolean
  ): Promise<Icategory | null> {
    try {
      console.log(
        `Updating category status to ${newStatus} for category ${categoryId}`
      );

      const updatedCategory = await this.updateOne(
        { _id: categoryId },
        { status: newStatus }
      );

      console.log(
        `Category status update operation completed:`,
        updatedCategory
      );
      return updatedCategory;
    } catch (error) {
      console.error(
        `Error in repository while updating category status:`,
        error
      );
      throw new Error(
        "Error occured while updating the category status:" + error
      );
    }
  }

  async updateCategory(
    id: string,
    updateData: { name?: string; image?: string }
  ): Promise<Icategory | null> {
    try {
      console.log(`Updating category with ID: ${id}`, updateData);

      const updatedCategory = await this.updateOne(
        { _id: id },
        { $set: updateData }
      );

      console.log(`Category updated successfully:`, updatedCategory);
      return updatedCategory;
    } catch (error) {
      console.error(`Error updating category:`, error);
      throw new Error(`Failed to update category: ${error}`);
    }
  }
}
