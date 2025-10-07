import { friendshipStatusEnum, GenderEnum, ProviderEnum,RoleEnum } from "../Enums/user.enum.js";
import { JwtPayload } from 'jsonwebtoken';
import { Request } from 'express';
import { Document, Types } from 'mongoose';


 interface IOTP{
    value:string,
    expiredAt:Date,
    otpType:string
 }
 interface IUser extends Document<Types.ObjectId>{
    firstName:string,
    lastName:string,
    email:string,
    isVerified?:boolean,
    password:string,
    confirmationPassword:string,
    role:RoleEnum,
    gender:GenderEnum,
    DOB?:Date,
    profilePic?:string,
    coverPic?:string,
    provider:ProviderEnum,
    googleId?:string,
    phoneNumber?:string,
    otp?:IOTP[],
    tokenId:string
    profileImage?:string,
    coverImage?:string[],
    
}

interface IPost extends Document{
    userId:Types.ObjectId,
    caption:string,
    image?:string,
    likes:[{
        userId:Types.ObjectId,
        like:boolean
    }],
    comments:[{
        userId:Types.ObjectId,
        comment:string
    }]
}

interface IComment extends Document{
    userId:Types.ObjectId,
    postId:Types.ObjectId,
    comment:string
}

interface IBlackListedToken extends Document{
   tokenId:String,
   expireAt:Date
}

 interface IEmailArgs{
    to:string,
    cc?:string,
    subject:string,
    content:string,
    attachments?:Array<{filename:string,path:string}>
}

interface IRequest extends Request {
   loggedInUser :{user :IUser,token :JwtPayload}
}


interface IFriendship extends Document<Types.ObjectId>{
    friendFromId:Types.ObjectId,
    friendToId:Types.ObjectId,
    status:friendshipStatusEnum
}



    export {IUser,IEmailArgs,IOTP,IRequest,IBlackListedToken,IPost,IComment,IFriendship}