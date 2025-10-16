import { NextFunction, Request, Response } from "express";
import { IRequest, IUser, OTPTypeEnum,  signUpBodyType } from "../../../Common/index.js";
import { userRepository } from "../../../DB/Repositories/user.repository.js";
import { userModel } from "../../../DB/Models/index.js";
import { blackListedRespository } from "../../../DB/Repositories/black-listed-repository.js";
import { blackListedTokenModel } from "../../../DB/Models/black-listed-token.js";
import { compareHash, encrypt, generateHash, localEmitter } from "../../../Utils/index.js";
import { v4 as uuidv4 } from "uuid";
import  jwt, { SignOptions }  from 'jsonwebtoken';
import { successResponse } from "../../../Utils/Response/response.helper.utils.js";

class authServices {
  private userRepo = new userRepository(userModel);
  private blackListedRepo = new blackListedRespository(blackListedTokenModel);

  //Sign up

  signUp = async (req: Request, res: Response, next: NextFunction) => {

    const {firstName,lastName,email,password,phoneNumber,gender,DOB,confirmationPassword}:signUpBodyType= req.body

  const isEmailExist = await this.userRepo.findOneDocument({ email }, "email");

  if (isEmailExist) {
    return res
      .status(409)
      .json({ message: "Email already exists", data: { invalidEmail: email } });
  }



  // send otp to email
  const otp = Math.floor(Math.random() * 10000).toString();
  localEmitter.emit("sendEmail", {
    to: email,
    subject: "Email Verification",
    content: `<h1>Your OTP is ${otp}</h1>`,
  });

  const confirmationOTP = {
    value: generateHash(otp),
    expiredAt: new Date(Date.now() + 600000),
    otpType: OTPTypeEnum.CONFIRMATION,
  };

  const newUser = await this.userRepo.createNewDocument({
    firstName,
    lastName,
    phoneNumber,
    email,
    password,
    confirmationPassword,
    gender,
    DOB,
    otp: [confirmationOTP],
  });


  res
    .status(201)
    .json(successResponse<IUser>('user Created successfully',201,newUser as unknown as IUser));
};


  //confirmation email

  confirmEmail = async(req:Request,res:Response,next:NextFunction)=>{
    const {email,otp} :{email:string,otp:string} = req.body

    const user = await this.userRepo.findOneDocument({email})

    if(!user) return res.status(404).json({message:'user not found'})

      if(user.isVerified) return res.status(401).json({message:'email is verifed already'})

        const confirmationOtp = user.otp?.find(
  o => o.otpType.toLowerCase() === "confirmation"
);


        if(!confirmationOtp) return res.status(401).json({message:"No OTP found for this user"})

          if(new Date() > confirmationOtp.expiredAt ) return res.status(400).json({message:"Otp expired"})

            const isValid = compareHash(otp,confirmationOtp.value)
            if(!isValid) return res.status(400).json({message:"otp invalid"})

              await this.userRepo.updateOneDocument(
                { _id: user._id },  
    { $set: { isVerified: true } }
              )

              return res.status(200).json({
    message: "Email confirmed successfully",
    data: { email: user.email }
  });

  }

  //Sign in

  signIn = async (req:Request,res:Response,next:NextFunction)=>{
  const {email,password}:Partial<IUser> = req.body

  const user = await this.userRepo.findOneDocument({email})

  if(!user) return res.status(404).json({message:"user not found"})

  const isValidPassword = compareHash(password as string ,user.password)
  if(!isValidPassword) return res.status(401).json({message:""})

  const jti = uuidv4();
  const payLoad = {
    _id:user._id,
    email:user.email,
    role:user.role,
    jti,
  }

  const accessToken = jwt.sign(
    payLoad,
    process.env.JWT_SECRET_KEY as string,
    { expiresIn: process.env.JWT_EXPIRATION_TIME } as SignOptions
  );

  const refreshToken = jwt.sign(
    payLoad,
    process.env.JWT_REFRESH_TOKEN_SECRET_KEY as string,
    { expiresIn: process.env.JWT_REFRESH_TOKEN_EXPIRATION } as SignOptions
  );

  await this.userRepo.updateOneDocument(
    { _id: user._id }, 
    { $set: { tokenId: jti } }
  );

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  });

  return res.status(200).json({
    message:'user login successfully', 
    data: {
      accessToken,
      refreshToken,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
      },
    },
  })
}

  // Refresh Token
  refreshToken = async (req: Request, res: Response, next: NextFunction) => {
    const { user } = (req as unknown as IRequest).loggedInUser;

    const jti = uuidv4();
    const payLoad = {
      _id: user._id,
      email: user.email,
      role: user.role,
      jti,
    };

    const accessToken = jwt.sign(
      payLoad,
      process.env.JWT_SECRET_KEY as string,
      { expiresIn: process.env.JWT_EXPIRATION_TIME } as SignOptions
    );

    const newRefreshToken = jwt.sign(
      payLoad,
      process.env.JWT_REFRESH_TOKEN_SECRET_KEY as string,
      { expiresIn: process.env.JWT_REFRESH_TOKEN_EXPIRATION } as SignOptions
    );

    await this.userRepo.updateOneDocument(
      { _id: user._id },
      { $set: { tokenId: jti } }
    );

    // update cookie
    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    });

    return res.status(200).json({
      message: 'token refreshed successfully',
      data: {
        accessToken,
        refreshToken: newRefreshToken,
        user: {
          id: user._id,
          email: user.email,
          role: user.role,
        },
      },
    });
  }

  //Log Out
  logOut = async (req: Request, res: Response, next: NextFunction) => {
    const {
      token: { jti, exp },
    } = (req as unknown as IRequest).loggedInUser;

    if (!exp) {
      return res
        .status(400)
        .json({ message: "Invalid token: missing expiration" });
    }

    const blackListedToken = await this.blackListedRepo.createNewDocument({
      tokenId: jti,
      expireAt: new Date(exp * 1000), 
    });

    await this.userRepo.updateOneDocument(
    { tokenId: jti },
    { $unset: { tokenId: "" } }
  );

    return res.status(200).json({
      message: "user logged out successfully",
      data: { blackListedToken },
    });
  };
}

export default new authServices();
