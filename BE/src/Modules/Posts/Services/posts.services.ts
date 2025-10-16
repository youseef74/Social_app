import { NextFunction ,Request,Response} from "express";
import { postModel } from "../../../DB/Models/post.model.js";
import { PostsRepository } from "../../../DB/Repositories/index.js";
import { badRequestException, s3ClientServices } from "../../../Utils/index.js";
import { IRequest } from "../../../Common/index.js";
import { Types } from "mongoose";




export class PostsService{
    private s3 = new s3ClientServices()
    private postRepo = new PostsRepository(postModel)

    createPost = async (req:Request,res:Response,next:NextFunction) =>{
        const {caption} = req.body
        const {user} = (req as unknown as IRequest).loggedInUser


        if(!caption) throw new badRequestException("caption is required")
        if(!user) throw new badRequestException("user is required")

            const post = new postModel({
                userId:user._id,
                caption
            })

            await post.save()
            res.json({message:"Post created successfully"})
    }

    updatePost = async (req:Request,res:Response,next:NextFunction)=>{
        const{caption} = req.body
        const {user} = (req as unknown as IRequest).loggedInUser

        if(!caption) throw new badRequestException("caption is required")
        if(!user) throw new badRequestException("user is required")

            const post = await this.postRepo.findAndUpdateDocument(
                { userId: new Types.ObjectId(user._id) },
                { $set: { caption } }
            )
            res.json({message:"Post updated successfully",post})
    }

    deletePost = async(req:Request,res:Response,next:NextFunction)=>{
        const {user} = (req as unknown as IRequest).loggedInUser
        const {postId} = req.params

        if(!user) throw new badRequestException("user is required")
        if(!postId) throw new badRequestException("postId is required")

        const post = await this.postRepo.findAndDeleteDocument({
            _id: new Types.ObjectId(postId),
            userId: new Types.ObjectId(user._id)
        })
        res.json({message:"Post deleted successfully",post})
    }


    getAllPosts = async(req:Request,res:Response,next:NextFunction)=>{


        const post = await this.postRepo.findDocuments({})
        if(!post) throw new badRequestException("No posts found")
        res.json({message:"All posts",post})
    }


    getPostById = async (req:Request,res:Response,next:NextFunction)=>{
        const {postId} = req.params
        const {user} = (req as unknown as IRequest).loggedInUser

        if(!postId) throw new badRequestException("postId is required")
            if(!user) throw new badRequestException("user is required")

                const post = await this.postRepo.findOneDocument({
                    _id: new Types.ObjectId(postId),
                    userId: new Types.ObjectId(user._id)
                } as any)
                if(!post) throw new badRequestException("Post not found")
                res.json({message:"Post found",post})
    }

    getPostsByUserId = async (req:Request,res:Response,next:NextFunction)=>{
        const {user} = (req as unknown as IRequest).loggedInUser
        const {userId} = req.params

        if(!user) throw new badRequestException("user is required")
        if(!userId) throw new badRequestException("userId is required")

        const posts = await this.postRepo.findDocuments({
            userId: new Types.ObjectId(userId)
        })
        if(!posts) throw new badRequestException("No posts found")
        res.json({message:"Posts found",posts})
    }
}
export default new PostsService()
