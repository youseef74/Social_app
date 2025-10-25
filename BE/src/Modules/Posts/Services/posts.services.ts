import { NextFunction ,Request,Response} from "express";
import { postModel } from "../../../DB/Models/post.model.js";
import { PostsRepository, userRepository } from "../../../DB/Repositories/index.js";
import { badRequestException, s3ClientServices } from "../../../Utils/index.js";
import { friendshipStatusEnum, IRequest } from "../../../Common/index.js";
import { Types } from "mongoose";
import { userModel } from "../../../DB/Models/user.model.js";
import { friendshipRepository } from "../../../DB/Repositories/friendship.repository.js";
import { pagiantion } from "../../../Utils/pagiantion/pagiantion.utils.js";





export class PostsService{
    private s3 = new s3ClientServices()
    private postRepo = new PostsRepository(postModel)
    private userRepo = new userRepository(userModel)
    private friendshipRepo = new friendshipRepository()
    createPost = async (req:Request,res:Response,next:NextFunction) =>{
        const {caption,allowComment,tag} = req.body
        const {user} = (req as unknown as IRequest).loggedInUser

        const files = req.files as Express.Multer.File[]
        if(!caption && (!files || !files.length)) throw new badRequestException("caption or file is required")
        if(!user) throw new badRequestException("user is required")

            let uniqueTag = []
            if(tag){
                const users = await this.userRepo.findDocuments({
                    _id:{$in:tag}
                })
                if(users.length !== tag.length) throw new badRequestException("Invalid tag")

                    const friends = await this.friendshipRepo.findDocuments({
                        status:friendshipStatusEnum.ACCEPTED,
                        $or:[
                            {friendFromId:user._id,friendToId:{$in:tag}},
                            {friendToId:user._id,friendFromId:{$in:tag}}
                        ]
                    })
                    if(friends.length !== tag.length) throw new badRequestException("You are not friends with all the tagged users")

                        uniqueTag = Array.from(new Set(tag))
            }

            let attachment: string[] = []
            if(files?.length){
                const uplaodedFiles = await this.s3.uploadFileOnS3(files,`${user._id}/posts`) as {key: string; url: string;}[]
                attachment = uplaodedFiles.map((file)=>file.key)
            }

            const post = new postModel({
                userId:user._id,
                caption,
                allowComment,
                tag,
                attachment,

            })

            await post.save()
            res.json({message:"Post created successfully",post})
    }

    listHomePosts = async (req:Request,res:Response,next:NextFunction)=>{
        const {page,limit} = req.query
        const {limit:currentLimit,skip} = pagiantion({page:Number(page),limit:Number(limit)})
        console.log(currentLimit,page,skip);
        

        // const posts = await this.postRepo.findDocuments({},{limit:currentLimit, skip})
        // const totalPosts = await this.postRepo.countDocuments({})

        const posts = await this.postRepo.postPagination({},{
            limit:currentLimit,
            page:Number(page),
            customLabels:{
                docs:"posts",
                totalDocs:"totalPosts",
                limit:"limit",
                page:"page",
                totalPages:"totalPages",
                pagingCounter:"pagingCounter",
                hasPrevPage:"hasPrevPage",
                hasNextPage:"hasNextPage",
                prevPage:"prevPage",
                nextPage:"nextPage"
            }

        })

        return res.json({success:true,message:"Posts fetched successfully",data:{posts}})

    }

    updatePost = async (req:Request,res:Response,next:NextFunction)=>{
        const{caption,allowComment,tag} = req.body
        const {user} = (req as unknown as IRequest).loggedInUser

        if(!caption) throw new badRequestException("caption is required")
        if(!user) throw new badRequestException("user is required")

            const post = await this.postRepo.findAndUpdateDocument(
                { userId: new Types.ObjectId(user._id) },
                { $set: { caption,allowComment,tag } },
                {new:true}
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
