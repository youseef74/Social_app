import { Model, PaginateOptions, QueryOptions } from "mongoose";
import { BaseRepository } from "./base.repository.js";
import { IPost } from "../../Common/index.js";
import { FilterQuery } from "mongoose";
import { postModel } from "../Models/post.model.js";

export class PostsRepository extends BaseRepository<IPost>{
    constructor(protected _postModel:Model<IPost>){
        super(_postModel)
    }

    async countDocuments(filters:FilterQuery<IPost>):Promise<number>{
        return await this._postModel.countDocuments(filters)
    }

    async postPagination(filters?:FilterQuery<IPost>,options?:PaginateOptions){
        return await postModel.paginate(filters,options)
    }
}