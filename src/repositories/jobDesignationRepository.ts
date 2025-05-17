import { FilterQuery } from "mongoose";
import { IjobDesignationRepository } from "../interfaces/Irepositories/IjobDesignationRepository";
import { IjobDesignation } from "../interfaces/Models/IjobDesignation";
import jobDesignation from "../models/jobDesignationModel";
import { BaseRepository } from "./baseRepository";
import { injectable } from "tsyringe";

@injectable()
export class JobDesignationRepository
  extends BaseRepository<IjobDesignation>
  implements IjobDesignationRepository
{
  constructor() {
    super(jobDesignation);
  }

  async getAllDesignations(options: {
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<{
    data: IjobDesignation[];
    total: number;
    page: number;
    limit: number;
    pages: number;
  }> {
    try {
      console.log("entering the function which fetches all job designations");
      const page = options.page || 1;
      const limit = options.limit || 5;

      const filter: FilterQuery<IjobDesignation> = {};

      if (options.search) {
        filter.$or = [
          { designation: { $regex: options.search, $options: "i" } }
        ];
      }

      const result = (await this.find(filter, {
        pagination: { page, limit },
        sort: { createdAt: -1 },
      })) as { data: IjobDesignation[]; total: number };

      return {
        data: result.data,
        total: result.total,
        page,
        limit,
        pages: Math.ceil(result.total / limit),
      };
    } catch (error) {
      console.log("error occurred while fetching job designations:", error);
      throw new Error("Failed to fetch job designations");
    }
  }

  async findByName(name: string): Promise<IjobDesignation | null> {
    try {
      return await jobDesignation.findOne({ designation: name });
    } catch (error) {
      throw new Error("Failed to find designation by name: " + error);
    }
  }

  async findById(id: string): Promise<IjobDesignation | null> {
    try {
      return await jobDesignation.findById(id).exec();
    } catch (error) {
      throw new Error("Error finding designation by ID: " + error);
    }
  }

  async addDesignation(designation: string): Promise<IjobDesignation> {
    try {
      const newDesignation = await this.create({ designation });
      console.log(
        "new Designation in the addDesignation repository:",
        newDesignation
      );
      return await newDesignation.save();
    } catch (error) {
      throw new Error("Failed to add designation: " + error);
    }
  }

async blockDesignation(id: string, status: boolean): Promise<IjobDesignation | null> {
  try {
    const updatedDesignation = await this.updateOne({ _id: id }, { Status: status });
    
    console.log(
      "blocking the designation in the jobdesignation repository:",
      updatedDesignation
    );
    
    return updatedDesignation;
  } catch (error) {
    throw new Error("Failed to block designation: " + error);
  }
}
}
