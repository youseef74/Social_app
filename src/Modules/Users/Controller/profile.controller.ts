import { Router } from "express";
import { authentication } from "../../../Middleware/authentication.middleware.js";
import { Multer } from "../../../Middleware/multer.middleware.js";
import profileServices from "../Services/profile.services.js";

const profileController = Router();
const upload = Multer()



// update profile
profileController.put("/update/:_id",authentication,profileServices.updateAccount)

// get profile
profileController.get("/profile/:_id",profileServices.getProfile)

//list users
profileController.get('/list',profileServices.listUsers)

// upload profile image
profileController.post("/profile-image",authentication,upload.single("profileImage"),profileServices.uploadProfileImage);

// upload cover image
profileController.post("/cover-image",authentication,upload.single("coverImage"),profileServices.uploadCoverImage)

// renew signed url
profileController.post("/renew-url",authentication,profileServices.reNewSignedUrl)

// delete account
profileController.delete("/delete/:_id",authentication,profileServices.deleteAccount)

//send friend request
profileController.post('/send-request',authentication,profileServices.sendFriendRequest)

//list requests
profileController.get('/list-requests',authentication,profileServices.listRequests)

//respond to friend request
profileController.patch('/respond-to-request',authentication,profileServices.respondToFriendRequest)

//get friends
profileController.get('/friends',authentication,profileServices.getFriends)


export default profileController;
