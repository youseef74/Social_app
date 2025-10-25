import mongoose, { Model, plugin } from "mongoose";
import { IPost } from "../../Common/index.js";
import mongoosePaginate from "mongoose-paginate-v2";
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
    allowComment:{
        type:Boolean,
        default:true
    },
    tag:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true
    }],
    image:{
        type:[String]
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
postSchema.plugin(mongoosePaginate)
const postModel = mongoose.model<IPost>('Post',postSchema) as Model<IPost> & { paginate: any }

export {postModel}