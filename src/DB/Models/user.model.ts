import mongoose from "mongoose";
import { GenderEnum, ProviderEnum, RoleEnum, IUser, OTPTypeEnum } from "../../Common/index.js";
import { encrypt, generateHash, s3ClientServices } from "../../Utils/index.js";


const userSchema = new mongoose.Schema<IUser>({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  confirmationPassword: { type: String, required: true },
  isVerified: { type: Boolean, default: false },
  role: { type: String, enum: Object.values(RoleEnum), default: RoleEnum.USER },
  gender: { type: String, enum: Object.values(GenderEnum), default: GenderEnum.MALE },
  DOB: Date,
  phoneNumber: String,
  provider: { type: String, enum: Object.values(ProviderEnum), default: ProviderEnum.LOCAL },
  googleId: String,
  otp: [{
    value: { type: String, required: true },
    expiredAt: { type: Date, default: () => Date.now() + 600000 },
    otpType: { type: String, enum: Object.values(OTPTypeEnum), required: true }
  }],
  tokenId: { type: String },
  profileImage: { type: String },
  coverImage: [String]
})

//Document middleware

userSchema.pre('save',function(){
  console.log(this.isModified("password"));
  console.log(this.getChanges());
  console.log(this.modifiedPaths());

  if(this.isModified("password")){

    this.password = generateHash(this.password as string)
    this.confirmationPassword = generateHash(this.confirmationPassword as string)

  }
  
  if(this.isModified("phoneNumber")){
    this.phoneNumber = encrypt(this.phoneNumber as string)
  }
  
  
})

//Query middleware

userSchema.pre(['findOne','findOneAndUpdate'],function(){
  console.log('user found',this);
  
})

userSchema.post('findOne',function(doc){
  console.log('user found',doc);
})
const S3service = new s3ClientServices()
userSchema.post('findOneAndDelete',async function(doc){
  if(doc.profileImage){
    await S3service.deleteFileFromS3(doc.profileImage)

  }
})

const userModel = mongoose.model<IUser>("users",userSchema)



export{userModel}