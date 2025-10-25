import { IFriendship } from "../../Common/index.js";
import { friendshipModel } from "../Models/friendship.model.js";
import { BaseRepository } from "./base.repository.js";


export class friendshipRepository extends BaseRepository<IFriendship>{
    constructor(){
        super(friendshipModel)
    }
}