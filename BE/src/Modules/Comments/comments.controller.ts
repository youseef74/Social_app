import {Router} from 'express';
import  CommentsService  from './Services/comments.services.js';


const commentsController = Router();


// Add comment
commentsController.post("/create-comment/:postId",CommentsService.createComment)

// Update comment
commentsController.put("/update-comment/:commentId",CommentsService.updateComment)
// Delete comment
commentsController.delete("/delete-comment/:commentId",CommentsService.deleteComment)
// Get all comments
commentsController.get("/get-all-comments",CommentsService.getAllComments)
// Get comment by ID
commentsController.get("/get-comment-by-id/:commentId",CommentsService.getCommentById)


export default commentsController