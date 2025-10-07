import mongoose, { Types } from "mongoose";

import { IComment } from "../../Common/index.js";

const commentSchema = new mongoose.Schema<IComment>({
    userId: Types.ObjectId,
    postId: Types.ObjectId,
    comment: String,
}, { timestamps: true });

const commentModel = mongoose.model<IComment>('Comment', commentSchema);

export default commentModel
