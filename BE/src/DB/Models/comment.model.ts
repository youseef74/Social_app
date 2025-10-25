import mongoose, { Types } from "mongoose";

import { IComment } from "../../Common/index.js";

const commentSchema = new mongoose.Schema<IComment>({
    userId: Types.ObjectId,
    postId: Types.ObjectId,
    comment: String,
    attachments:String,
    tag:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true
    }]
}, { timestamps: true });

const commentModel = mongoose.model<IComment>('Comment', commentSchema);

export default commentModel
