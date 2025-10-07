import { promises } from "dns";
import mongoose, { FilterQuery, Model, ProjectionType, QueryOptions, UpdateQuery } from "mongoose";

export abstract class BaseRepository<T> {
  constructor(private model: Model<T>) {}

  async createNewDocument(document: Partial<T>) {
    return await this.model.create(document)
  }

  async findOneDocument(
    filters: FilterQuery<T>,
    objection?: ProjectionType<T>,
    options?: QueryOptions
  ): Promise<T | null> {
    return await this.model.findOne(filters, objection, options);
  }

  async findDocumentsById(
    id: mongoose.Schema.Types.ObjectId | string,
    projection?: ProjectionType<T>,
    options?: QueryOptions<T>
  ): Promise<T | null> {
    return await this.model.findById(id, projection, options);
  }

  async createDocument(document: Partial<T>): Promise<T> {
    return await this.model.create(document);
  }

  async updateOneDocument(
    filters: FilterQuery<T>,
    update: UpdateQuery<T>,
    options?: QueryOptions
  ): Promise<T | null> {
    return await this.model.findOneAndUpdate(filters, update, {
      new: true,
      ...options,
    });
  }
  async findAndUpdateDocument(filters:FilterQuery<T>,update:UpdateQuery<T>,options?:QueryOptions<T>):Promise<T | null> {
    return await this.model.findOneAndUpdate(filters,update,{
        new:true,
        ...options
    })
  }
  async deleteByIdDocument(id:mongoose.Schema.Types.ObjectId | string) {
    return await this.model.findByIdAndDelete(id)
  }
  
  deleteOneDocument() {}

  updateMultiDocument() {}

  deleteMultiDocument() {}

  async findAndDeleteDocument(
    filters: FilterQuery<T>,
    options?: QueryOptions<T>
  ): Promise<T | null> {
    return await this.model.findOneAndDelete(filters, options);
  }
  findDocuments(filters:FilterQuery<T>,options?:QueryOptions<T>):Promise<T[]> {
    return this.model.find(filters,options)
  }
}
