import {Router} from 'express';
import authServices from '../Services/auth.services.js';
import { authentication } from '../../../Middleware/authentication.middleware.js';
import { validationMiddleware } from '../../../Middleware/validation.middleware.js';
import { signUpValidator } from '../../../Validator/index.js';
import { refreshTokenMiddleware } from '../../../Middleware/refresh-token.middleware.js';



const authController = Router();

// signUp
authController.post('/signup', validationMiddleware(signUpValidator),authServices.signUp);

// signIn
authController.post('/signin',authServices.signIn)

// refresh token
authController.post('/refresh', refreshTokenMiddleware, authServices.refreshToken)

//logout
authController.get('/logout',authentication,authServices.logOut)

// Confirm email
authController.post('/confirm',authServices.confirmEmail)

// Forgot password


// Reset password


//Auth with gmail


// resent


export default authController