import z from "zod";
import { signUpValidator } from "../../Validator/index.js";



export type signUpBodyType = z.infer<typeof signUpValidator.body>