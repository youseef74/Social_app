import { IBlackListedToken } from "../../Common/index.js";
import { blackListedTokenModel } from "../Models/black-listed-token.js";
import { BaseRepository } from "./base.repository.js";
import { Model } from 'mongoose';



export class blackListedRespository extends BaseRepository<IBlackListedToken>{
    constructor(protected _blackListedTokenModel:Model<IBlackListedToken>){
        super(blackListedTokenModel)
    }

    
}