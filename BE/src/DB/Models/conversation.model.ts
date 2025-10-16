import mongoose, { Types } from "mongoose";


const conversationSchema = new mongoose.Schema({
    type:{
        type:String,
        enum:["direct","group"],
        default:"direct"
    },
    name:String,
    members:[{type:Types.ObjectId,ref:"User"}]
})

export const ConversationModel = mongoose.model("Conversation",conversationSchema)