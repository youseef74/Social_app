import { z } from "zod";
import { GenderEnum } from "../../Common/index.js";


export const signUpValidator = {
  body: z.object({
    firstName: z.string().min(3).max(20),
    lastName: z.string().min(3).max(20),
    email: z.string().email(),
    password: z.string(),
    confirmationPassword: z.string(),
    DOB: z.coerce.date(),
    gender: z.nativeEnum(GenderEnum),
    phoneNumber: z.string().min(11).max(15),
  }),
};