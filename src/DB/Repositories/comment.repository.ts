import { model, Model } from "mongoose";
import { IComment } from "../../Common/index.js";
import { BaseRepository } from "./base.repository.js";


export class CommentRepository extends BaseRepository<IComment>{
    constructor(protected _commentModel:Model<IComment>){
        super(_commentModel)
    }
}