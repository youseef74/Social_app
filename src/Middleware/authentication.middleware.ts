import { Response, NextFunction, Request } from "express";
import { verifyToken } from "../Utils/token.js";
import { IUser, IRequest } from "../Common/index.js";
import { userRepository } from "../DB/Repositories/user.repository.js";
import { userModel } from "../DB/Models/user.model.js";
import { JwtPayload } from "jsonwebtoken";

const userRepo = new userRepository(userModel);

export const authentication = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const accessToken = req.get("authorization");
  if (!accessToken) {
    return res.status(401).json({ message: "sign in required" });
  }

  const [prefix, token] = accessToken.split(" ");
  if (prefix !== process.env.JWT_PREFIX) {
    return res.status(401).json({ message: "invalid token" });
  }

  const decodedData = verifyToken(token, process.env.JWT_SECRET_KEY as string);
  if (!decodedData || typeof decodedData === "string" || !("_id" in decodedData)) {
    return res.status(401).json({ message: "invalid payload" });
  }

  const user: IUser | null = await userRepo.findOneDocument({ tokenId: decodedData.jti });
  if (!user) {
    return res.status(404).json({ message: "Your session has expired. Please login again" });
  }

  (req as IRequest).loggedInUser = { user, token: decodedData as JwtPayload };

  next();
};
