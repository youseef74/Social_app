import {Router} from "express";
import { authentication } from "../../Middleware/authentication.middleware.js";
import { Multer } from "../../Middleware/multer.middleware.js";
import postsServices from "./Services/posts.services.js";

const postsController = Router();
const upload = Multer()

// create post
postsController.post("/create",authentication,upload.array("files"),postsServices.createPost)

// list home posts
postsController.get("/list-home-posts",authentication,postsServices.listHomePosts)

// Update post
postsController.put("/update",authentication,postsServices.updatePost)
// Delete post
postsController.delete("/delete/:postId",authentication,postsServices.deletePost)
// Get all posts
postsController.get("/all-posts",postsServices.getAllPosts)
// Get post by id
postsController.get("/get-post/:postId",postsServices.getPostById)
// Get posts for specific user
postsController.get("/get-posts/:userId",postsServices.getPostsByUserId)

export default postsController