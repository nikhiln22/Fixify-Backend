import { ICategory } from "../interfaces/Models/Icategory";
import { BaseRepository } from "./baseRepository";
import { injectable } from "tsyringe";
import category from "../models/categoryModel";
import { ICategoryRepository } from "../interfaces/Irepositories/IcategoryRepository";
import { FilterQuery } from "mongoose";

@injectable()
export class CategoryRepository
  extends BaseRepository<ICategory>
  implements ICategoryRepository
{
  constructor() {
    super(category);
  }

  async addCategory(name: string, image: string): Promise<ICategory> {
    try {
      console.log("adding the categories by the admin into the database");
      const newCategory = await this.create({ name, image });
      return newCategory;
    } catch (error) {
      console.log("error occured while adding the category", error);
      throw new Error("failed to add the new Category");
    }
  }

  async findCategoryByName(name: string): Promise<ICategory | null> {
    try {
      console.log("Checking if category already exists...");
      return await this.findOne({ name });
    } catch (error) {
      console.error("Error occurred while finding the category:", error);
      throw new Error("Failed to find category by name");
    }
  }

  async getAllCategories(options: {
    page?: number;
    limit?: number;
    search?: string;
    categoryId?: string;
    status: string;
  }): Promise<{
    data: ICategory[];
    total: number;
    page: number;
    limit: number;
    pages: number;
  }> {
    try {
      console.log("getting all the categories from the database");
      const page = options.page;
      const limit = options.limit;

      const filter: FilterQuery<ICategory> = {};

      if (options.search) {
        filter.$or = [{ name: { $regex: options.search, $options: "i" } }];
      }

      if (options.status) {
        if (options.status === "active") {
          filter.status = "Active";
        } else if (options.status === "blocked") {
          filter.status = "Blocked";
        }
      }

      if (page !== undefined && limit !== undefined) {
        const result = (await this.find(filter, {
          pagination: { page: page, limit: limit },
          sort: { createdAt: -1 },
        })) as { data: ICategory[]; total: number };

        console.log("categories with pagination:", result);
        return {
          data: result.data,
          total: result.total,
          page: page,
          limit: limit,
          pages: Math.ceil(result.total / limit),
        };
      } else {
        const allCategories = (await this.find(filter, {
          sort: { createdAt: -1 },
        })) as ICategory[];

        console.log("all categories without pagination:", allCategories);
        return {
          data: allCategories,
          total: allCategories.length,
          page: 1,
          limit: allCategories.length,
          pages: 1,
        };
      }
    } catch (error) {
      console.log("Error occured with the fetchning the categories:", error);
      throw new Error("An error occurred while retrieving the categories");
    }
  }

  async findCategoryById(id: string): Promise<ICategory | null> {
    try {
      return await this.findById(id);
    } catch (error) {
      throw new Error("Error finding category by ID: " + error);
    }
  }

  async updateCategoryStatus(
    categoryId: string,
    newStatus: string
  ): Promise<ICategory | null> {
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
      console.log(`Error in repository while updating category status:`, error);
      throw new Error(
        "Error occured while updating the category status:" + error
      );
    }
  }

  async updateCategory(
    id: string,
    updateData: { name?: string; image?: string }
  ): Promise<ICategory | null> {
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
