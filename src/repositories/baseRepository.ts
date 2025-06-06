import { Model, Document, FilterQuery, UpdateQuery, SortOrder } from "mongoose";

export class BaseRepository<T extends Document> {
  protected model: Model<T>;

  constructor(model: Model<T>) {
    this.model = model;
  }

  async create(data: Partial<T>) {
    const createdDoc = new this.model(data);
    return await createdDoc.save();
  }

  async find(
    filter: FilterQuery<T> = {},
    options?: {
      pagination?: { page: number; limit: number };
      sort?: Record<string, SortOrder>;
    }
  ): Promise<T[] | { data: T[]; total: number }> {
    let query = this.model.find(filter);

    if (options?.sort) {
      query = query.sort(options.sort);
    }

    if (options?.pagination) {
      const { page, limit } = options.pagination;
      const skip = (page - 1) * limit;

      query = query.skip(skip).limit(limit);

      const data = await query.exec();

      const total = await this.countDocument(filter);

      return {
        data,
        total,
      };
    }
    return await query.exec();
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

  async deleteOne(filter: FilterQuery<T>): Promise<T | null> {
    return await this.model.findOneAndDelete(filter).exec();
  }

  async deleteMany(
    filter: FilterQuery<T>
  ): Promise<{ acknowledged: boolean; deletedCount: number }> {
    const result = await this.model.deleteMany(filter);
    return {
      acknowledged: result.acknowledged,
      deletedCount: result.deletedCount,
    };
  }

  async countDocument(filter: FilterQuery<T> = {}): Promise<number> {
    return await this.model.countDocuments(filter).exec();
  }
}
