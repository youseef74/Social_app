import {Router} from 'express';
import authServices from '../Services/auth.services.js';
import { authentication } from '../../../Middleware/authentication.middleware.js';


const authController = Router();

// signUp
authController.post('/signup', authServices.signUp);

// signIn
authController.post('/signin',authServices.signIn)

//logout
authController.get('/logout',authentication,authServices.logOut)

// Confirm email

authController.post('/confirm',authServices.confirmEmail)

// Forgot password


// Reset password


//Auth with gmail


// resent


export { authController }