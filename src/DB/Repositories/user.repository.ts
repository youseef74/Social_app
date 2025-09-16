import { Model } from "mongoose";
import { BaseRepository } from "./base.repository.js";
import { IUser } from "../../Common/index.js";


export class userRepository extends BaseRepository<IUser>{
    constructor(protected _userModel:Model<IUser>){
        super(_userModel)
    }
}