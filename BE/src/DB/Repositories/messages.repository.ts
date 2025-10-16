import { Model } from "mongoose";
import { IMessage } from "../../Common/index.js";
import { BaseRepository } from "./base.repository.js";


export class MessagesRepository extends BaseRepository<IMessage>{
    constructor(protected _messageModel:Model<IMessage>){
        super(_messageModel)
    }
}