import mongoose, { Model } from "mongoose";
import { IPost } from "../../Common/index.js";

const postSchema = new mongoose.Schema({
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true
    },
    caption:{
        type:String,
        required:true
    },
    image:{
        type:String
    },
    likes:[{
        userId:{
            type:mongoose.Schema.Types.ObjectId,
            ref:'User',
            required:true,
        },
        like:{
            type:Boolean,
            default:false
        }
    }],
    comments:[{
        userId:{
            type:mongoose.Schema.Types.ObjectId,
            ref:'User',
            required:true
        },
        comment:{
            type:String,
            required:true
        }
    }]
},{
    timestamps:true
})

const postModel: Model<IPost> = mongoose.model<IPost>('Post',postSchema)

export {postModel}