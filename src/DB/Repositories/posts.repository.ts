import { Model } from "mongoose";
import { BaseRepository } from "./base.repository.js";
import { IPost } from "../../Common/index.js";

export class PostsRepository extends BaseRepository<IPost>{
    constructor(protected _postModel:Model<IPost>){
        super(_postModel)
    }
}