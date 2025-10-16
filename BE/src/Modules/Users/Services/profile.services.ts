// Services/profile.services.ts
import { Request, Response } from "express";
import mongoose from "mongoose";
import { s3ClientServices } from "../../../Utils/Services/s3-client-utils.js";
import { friendshipStatusEnum, IFriendship, IRequest } from "../../../Common/index.js";
import { badRequestException } from "../../../Utils/index.js";
import { successResponse } from "../../../Utils/Response/response.helper.utils.js";
import { userRepository } from "../../../DB/Repositories/user.repository.js";
import { userModel } from "../../../DB/Models/user.model.js";
import { freindshipRepository } from "../../../DB/Repositories/friendship.repository.js";
import { FilterQuery } from "mongoose";
import { ConversationRepository } from "../../../DB/Repositories/conversation.repository.js";
import { ConversationModel } from "../../../DB/Models/conversation.model.js";
export class profileServices {
  private s3 = new s3ClientServices();
  private userRepo = new userRepository(userModel)
  private friendshipRepo = new freindshipRepository()
  private conversationRepo = new ConversationRepository(ConversationModel as any)

  // upload profile image
  uploadProfileImage = async (req: Request, res: Response ) => {
    const {file} = req
    const {user} = (req as unknown as IRequest).loggedInUser
    if(!file) throw new badRequestException("File is required")

      const {key ,url} = await this.s3.uploadFileOnS3(file,`${user._id}/profile`)

      user.profileImage = key
      await user.save()
      res.json(successResponse<unknown>('profile image updated successfully',200,{key,url}))
    
  };

  // upload cover image
  uploadCoverImage = async(req:Request,res:Response)=>{
    const {file}= req
    const{user} = (req as unknown as IRequest).loggedInUser
    if(!file) throw new badRequestException('file is required')

      const {key ,url} = await this.s3.uploadFileOnS3(file,`${user._id}/cover`)

      if(!Array.isArray(user.coverImage)){
        user.coverImage = []
      } 
      
      user.coverImage.push(key)
      await user.save()
      res.json(successResponse<unknown>('cover image updated successfully',200,{key,url}))
  }

  // renew signed url
  reNewSignedUrl = async (req:Request,res:Response) =>{
    const {user} = (req as unknown as IRequest).loggedInUser
    const {key, keyType} : {key:string,keyType:'profileImage'| 'coverImage'} = req.body

    if(!key || !keyType) throw new badRequestException("key and keyType are required")
    
    if(user[keyType] !== key) throw new badRequestException("Invalid key")

      const url = await this.s3.getFileFromS3(key)
      res.json(successResponse<unknown>('url generated successfully',200,{url}))
  }

  // delete account
  deleteAccount = async (req:Request,res:Response) =>{

    const deletedUser = await this.userRepo.deleteByIdDocument(req.params._id as string )
    if(!deletedUser) throw new badRequestException("User not found")


    res.json(successResponse<unknown>('account deleted successfully',200))
  }

  // update account
  updateAccount = async (req:Request,res:Response) =>{
    const {firstName,lastName,email,password,confirmationPassword,phoneNumber,DOB,gender,} = req.body

    if(!firstName || !lastName || !email || !phoneNumber) throw new badRequestException("All fields are required")

      await this.userRepo.updateOneDocument(
        {_id:req.params._id as string ,email},
        {$set:{firstName,lastName,email,password,confirmationPassword,phoneNumber,DOB,gender}},
        {new:true}
      )
      res.json(successResponse<unknown>('account updated successfully',200))
  }

  // get profile
  getProfile = async (req:Request,res:Response) =>{
    const { user: { _id } } = (req as unknown as IRequest).loggedInUser
    const user = await this.userRepo.findDocumentsById(_id.toString())
    if(!user) throw new badRequestException("User not found")
    res.json(successResponse<unknown>('profile fetched successfully',200))
  }

  // list users
  listUsers = async (req:Request,res:Response) =>{
    const users = await this.userRepo.findDocuments({})
    res.json(successResponse<unknown>('users fetched successfully',200,users))
  }

  //send friend request
  sendFriendRequest = async (req:Request,res:Response) =>{
    const {user:{_id}} = (req as unknown as IRequest).loggedInUser //sender
    const {requestToId} = req.body //receiver
  
    const user = await this.userRepo.findDocumentsById(requestToId)
    if(!user) throw new badRequestException("User not found")
  
    const existingRequest = await this.friendshipRepo.findOneDocument({
      $or: [
        { friendFromId: _id, friendToId: requestToId },
        { friendFromId: requestToId, friendToId: _id }
      ]
    })
  
    if(existingRequest) {
      throw new badRequestException("Friend request already exists")
    }
  

    if(_id.toString() === requestToId) {
      throw new badRequestException("Cannot send friend request to yourself")
    }
  
    const friendship = await this.friendshipRepo.createDocument({
      friendFromId:_id,
      friendToId:new mongoose.Types.ObjectId(requestToId),
      status: friendshipStatusEnum.PENDING
    })
    res.json(successResponse<unknown>('friend request sent successfully',200,friendship))
  }

  // list requests
  listRequests = async (req:Request,res:Response) =>{
    const {user:{_id}} = (req as unknown as IRequest).loggedInUser
    const {status} = req.query 
  
    const filters:FilterQuery<IFriendship> = {}
  
    if(!status) {
      filters.friendToId = _id
      filters.status = friendshipStatusEnum.PENDING
    } else {
      filters.status = status
      
      if(status === friendshipStatusEnum.ACCEPTED) {
        filters.$or = [{friendFromId:_id},{friendToId:_id}]
      } else if(status === friendshipStatusEnum.PENDING) {
        filters.friendToId = _id
      }
    }
  
    const requests = await this.friendshipRepo.findDocuments(
      filters,
      {
        populate:[{
          path:"friendFromId",
          select:"firstName lastName profileImage"
        },
        {
          path:"friendToId", 
          select:"firstName lastName profileImage"
        }]
      }
    )
    const groups = await this.conversationRepo.findDocuments({type:"group",members:{$in:[_id]}})
    res.json(successResponse<{requests: IFriendship[], groups: any[]}>('requests fetched successfully',200,{requests,groups}))
  }

  // respond to friend request
  respondToFriendRequest = async (req:Request,res:Response) =>{
    const {user:{_id}} = (req as unknown as IRequest).loggedInUser
    const {friendRequestId,response} = req.body
  
    if(!Object.values(friendshipStatusEnum).includes(response)) {
      throw new badRequestException("Invalid response")
    }
  
    const friendRequest = await this.friendshipRepo.findOneDocument({
      _id:friendRequestId,
      friendToId:_id,
      status:friendshipStatusEnum.PENDING
    })
    
    if(!friendRequest) throw new badRequestException("Friend request not found")
  
    friendRequest.status = response
    await friendRequest.save()
    
    res.json(successResponse<IFriendship>('friend request responded successfully',200,friendRequest))
  }

  //get friends
  getFriends = async (req:Request,res:Response) =>{
    const {user:{_id}} = (req as unknown as IRequest).loggedInUser

    const friends = await this.friendshipRepo.findDocuments({
      $or:[
        {friendFromId:_id,status:friendshipStatusEnum.ACCEPTED},
        {friendToId:_id,status:friendshipStatusEnum.ACCEPTED}
      ]
    })
    
    res.json(successResponse<IFriendship[]>('friends fetched successfully',200,friends))
    
  }


  //create group
createGroup = async (req: Request, res: Response) => {
    const { user: { _id } } = (req as unknown as IRequest).loggedInUser;
    const { name, memberIds } = req.body;

    const members = await this.userRepo.findDocuments({ _id: { $in: memberIds } });
    if (members.length !== memberIds.length) throw new badRequestException("Invalid member ids");

    const allMemberIds = [...new Set([_id.toString(), ...memberIds])];

    const groups = await this.conversationRepo.createDocument({
        type: "group",
        name,
        members: [_id,...allMemberIds],
    });

  }

  //get groups
  getGroups = async (req:Request,res:Response) =>{
    const {user:{_id}} = (req as unknown as IRequest).loggedInUser

    const groups = await this.conversationRepo.findDocuments({type:"group",members:{$in:[_id]}})
    res.json(successResponse('groups fetched successfully',200,groups));
  }
}

export default new profileServices();
