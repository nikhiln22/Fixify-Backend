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

  async getAllDesignations(): Promise<IjobDesignation[]> {
    try {
      return await jobDesignation.find();
    } catch (error) {
      throw new Error("Failed to fetch designations: " + error);
    }
  }

  async getPaginatedDesignations(
    page: number,
    limit: number
  ): Promise<{ data: IjobDesignation[]; total: number }> {
    try {
      const skip = (page - 1) * limit;
      const data = await jobDesignation.find().skip(skip).limit(limit).exec();
      const total = await jobDesignation.countDocuments();
      return { data, total };
    } catch (error) {
      console.error("Error fetching paginated designations:", error);
      throw new Error("Failed to fetch paginated designations");
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

  async blockDesignation(id: string, status: boolean): Promise<void> {
    try {
      let response = await this.updateOne({ _id: id }, { Status: status });
      console.log(
        "blocking the designation in the jobdesignation repository:",
        response
      );
    } catch (error) {
      throw new Error("Failed to block designation: " + error);
    }
  }
}
