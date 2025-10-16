import { NextFunction, Request, Response } from "express";
import { JwtPayload } from "jsonwebtoken";
import { failedResponse } from "../Utils/Response/response.helper.utils.js";
import { userRepository } from "../DB/Repositories/user.repository.js";
import { userModel } from "../DB/Models/user.model.js";
import { verifyToken } from "../Utils/token.js";
import { IUser } from "../Common/index.js";


        const userRepo = new userRepository(userModel)

export const refreshTokenMiddleware = async (req:Request,res:Response,next:NextFunction)=>{




    const refreshToken = req.cookies.refreshToken;
    if(!refreshToken){
        return res.status(401).json(failedResponse('Unauthorized'));
    }

    const decoded = verifyToken(refreshToken,process.env.JWT_REFRESH_TOKEN_SECRET_KEY as string)

    if(!decoded || typeof decoded === 'string' || !('_id' in decoded)){
        return res.json(failedResponse('Invalid refresh token'));
    }

    const user: IUser | null = await userRepo.findOneDocument({ tokenId: (decoded as JwtPayload).jti });
  if (!user) {
    return res.status(401).json({ message: "refresh session expired, please login again" });
  }

    (req as any).loggedInUser = { user, token: decoded as JwtPayload };
    next();

    

}