import mongoose, { Model } from "mongoose";
import { friendshipStatusEnum, IFriendship } from "../../Common/index.js";


const friendshipSchema = new mongoose.Schema({
    friendFromId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    },
    friendToId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User'
    },
    status:{
        type:String,
        enum:friendshipStatusEnum,
        default:friendshipStatusEnum.PENDING
    }
})

const friendshipModel:Model<IFriendship> = mongoose.model<IFriendship>('Friendship',friendshipSchema)

export {friendshipModel}
