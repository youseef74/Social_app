import { GenderEnum, ProviderEnum,RoleEnum } from "../Enums/user.enum.js";
import { JwtPayload } from 'jsonwebtoken';
import { Request } from 'express';



 interface IOTP{
    value:string,
    expiredAt:Date,
    otpType:string
 }
 interface IUser extends Document{
    firstName:string,
    lastName:string,
    email:string,
    _id:string
    isVerified?:boolean,
    password:string,
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



    export {IUser,IEmailArgs,IOTP,IRequest,IBlackListedToken}