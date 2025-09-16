import mongoose from "mongoose";
import { GenderEnum, ProviderEnum, RoleEnum,IUser, OTPTypeEnum,IOTP } from "../../Common/index.js";


const userSchema = new mongoose.Schema<IUser>({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  isVerified: { type: Boolean, default: false },
  role: { type: String, enum: RoleEnum, default: RoleEnum.USER },
  gender: { type: String, enum: GenderEnum, default: GenderEnum.MALE },
  DOB: Date,
  phoneNumber: String,
  provider: { type: String, enum: ProviderEnum, default: ProviderEnum.LOCAL },
  googleId: String,
  otp: [{
    value: { type: String, required: true },
    expiredAt: { type: Date, default: Date.now() + 600000 },
    otpType: { type: String, enum: OTPTypeEnum, required: true }
  }],
  tokenId: { type: String }
})

const userModel = mongoose.model<IUser>("users",userSchema)

export{userModel}