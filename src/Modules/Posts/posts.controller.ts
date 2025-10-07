import {Router} from "express";
import postsServices from "./Services/posts.services.js";

const postsController = Router();

// create post
postsController.post("/create",postsServices.createPost)

// Update post
postsController.put("/update",postsServices.updatePost)
// Delete post
postsController.delete("/delete/:postId",postsServices.deletePost)
// Get all posts
postsController.get("/all-posts",postsServices.getAllPosts)
// Get post by id
postsController.get("/get-post/:postId",postsServices.getPostById)
// Get posts for specific user
postsController.get("/get-posts/:userId",postsServices.getPostsByUserId)

export default postsController