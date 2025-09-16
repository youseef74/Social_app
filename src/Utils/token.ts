import jwt, { SignOptions, JwtPayload } from "jsonwebtoken";

export const generateToken = (
  payload: string | object | Buffer, 
  secret: string,
  options?: SignOptions 
): string => {
  return jwt.sign(payload, secret, options);
};

export const verifyToken = (
  token: string,
  secret: string
): JwtPayload | string | null => {
  try {
    return jwt.verify(token, secret);
  } catch (err) {
    console.error("JWT verify error:", (err as Error).message);
    return null;
  }
};
