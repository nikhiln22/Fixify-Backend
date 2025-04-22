import { Model, Document, FilterQuery, UpdateQuery } from "mongoose";

export class BaseRepository<T extends Document> {
  protected model: Model<T>;

  constructor(model: Model<T>) {
    this.model = model;
  }

  async create(data: Partial<T>) {
    const createdDoc = new this.model(data);
    return await createdDoc.save();
  }

  async find(filter:FilterQuery<T>={}):Promise<T[]>{
    return await this.model.find(filter).exec()
  }

  async findOne(filter: FilterQuery<T>): Promise<T | null> {
    return await this.model.findOne(filter).exec();
  }

  async findById(id: string): Promise<T | null> {
    return await this.model.findById(id).exec();
  }

  async updateOne(
    filter: FilterQuery<T>,
    update: UpdateQuery<T>
  ): Promise<T | null> {
    return await this.model
      .findOneAndUpdate(filter, update, { new: true })
      .exec();
  }

  async countDocument(filter:FilterQuery<T>={}):Promise<number>{
    return await this.model.countDocuments(filter).exec()
  }
}
