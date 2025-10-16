import { BaseRepository } from "./base.repository.js";
import { IConversation } from "../../Common/index.js";
import { Model } from "mongoose";



export class ConversationRepository extends BaseRepository<IConversation>{
    constructor(protected _conversationModel:Model<IConversation>){
        super(_conversationModel)
    }
}