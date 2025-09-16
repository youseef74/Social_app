import mongoose from "mongoose";
import { IBlackListedToken } from "../../Common/index.js";


const blackListedTokenSchema = new mongoose.Schema<IBlackListedToken>({

    tokenId:{
        type:String,
        required:true
    },
    expireAt:{
        type:Date,
        required:true
    }

})

const blackListedTokenModel = mongoose.model<IBlackListedToken>("BlackListedToken",blackListedTokenSchema)

export{blackListedTokenModel}