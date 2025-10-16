import { NextFunction,Response,Request } from "express";
import commentModel from "../../../DB/Models/comment.model.js";
import { CommentRepository } from "../../../DB/Repositories/comment.repository.js";
import { IRequest } from "../../../Common/index.js";
import { badRequestException } from "../../../Utils/index.js";
import { PostsRepository } from "../../../DB/Repositories/posts.repository.js";
import { postModel } from "../../../DB/Models/post.model.js";



export class CommentsService{
    private commentRepo = new CommentRepository(commentModel)
    private postsRepo = new PostsRepository(postModel)

    createComment = async (req:Request,res:Response,next:NextFunction)=>{
        const {comment} = req.body
        const {user} = (req as unknown as IRequest).loggedInUser
        const { postId } = req.params as { postId?: string };

        if(!comment) throw new badRequestException("comment is required")
        if(!postId) throw new badRequestException("postId is required in route params")

       const post = await this.postsRepo.findDocumentsById(postId)
       if(!post) throw new badRequestException("post not found")

        const Comment = new commentModel({
            userId:user._id,
            postId,
            comment
        })
        
        await Comment.save()

        const updatedPost = await this.postsRepo.findAndUpdateDocument(
            { _id: postId } as any,
            { $push: { comments: { _id: (Comment as any)._id, userId: user._id as any, comment } } } as any,
            { new: true }
        )

        res.json({message:"Comment created successfully", comment: Comment, post: updatedPost}) 
    }

    updateComment = async (req:Request,res:Response,next:NextFunction)=>{
        const {comment} = req.body
        const {user} = (req as unknown as IRequest).loggedInUser
        const {commentId,postId} = req.params

        if(!comment) throw new badRequestException("comment is required")
        if(!user) throw new badRequestException("user is required")
        if(!commentId) throw new badRequestException("commentId is required in route params")


            const Comment = await this.commentRepo.findDocumentsById(commentId)
            if(!Comment) throw new badRequestException("comment not found")

                const updatedComment  = await this.commentRepo.findAndUpdateDocument({
                    _id:commentId
                },{
                    $set:{
                        comment
                    }
                })

                const updatedPost = await this.postsRepo.findAndUpdateDocument({
                    _id: postId,
                    "comments._id": commentId as any
                }, {
                    $set: {
                        "comments.$.comment": updatedComment?.comment
                    }
                }, { new: true } as any)

                res.json({message:"Comment updated successfully",comment:updatedComment,post:updatedPost})
    }

    deleteComment = async (req:Request,res:Response,next:NextFunction)=>{
        const {commentId,postId} = req.params
        const {user} = (req as unknown as IRequest).loggedInUser
    
        if(!commentId) throw new badRequestException("commentId is required in route params")
        if(!user) throw new badRequestException("user is required")
            const Comment = await this.commentRepo.deleteByIdDocument(commentId)
            if(!Comment) throw new badRequestException("comment not found")

                const updatePost = await this.postsRepo.findAndUpdateDocument({
                    "comments._id":commentId as any
                },{
                    $pull:{
                        comments:{_id:commentId as any}
                    }
                },{new:true} as any)

                res.json({message:"Comment deleted successfully",comment:Comment,post:updatePost})
    }

    getAllComments = async (req:Request,res:Response,next:NextFunction)=>{
        const comments = await this.commentRepo.findDocuments({})
        res.json({message:"Comments fetched successfully",comments})
    }

    getCommentById = async (req:Request,res:Response,next:NextFunction)=>{
        const {commentId} = req.params

        const comment = await this.commentRepo.findDocumentsById(commentId)
        if(!comment) throw new badRequestException("comment not found")
        res.json({message:"Comment fetched successfully",comment})
    }
            
        }


    
    

export default new CommentsService()
