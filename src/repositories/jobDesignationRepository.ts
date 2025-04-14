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
      return await newDesignation.save();
    } catch (error) {
      throw new Error("Failed to add designation: " + error);
    }
  }

  async blockDesignation(id: string): Promise<void> {
    try {
      await this.updateOne({ _id: id }, { Status: "Inactive" });
    } catch (error) {
      throw new Error("Failed to block designation: " + error);
    }
  }
}
