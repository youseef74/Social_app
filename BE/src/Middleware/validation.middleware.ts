import { NextFunction, Request, Response } from "express";
import { ZodType } from "zod";


type RequestKeyType = "body" | "query" | "params" | "headers"
type SchemaType = Partial<Record <RequestKeyType,ZodType>>


export const validationMiddleware = (schema:SchemaType)=>{
    return (req:Request,res:Response,next:NextFunction)=>{

        const reqKeys:RequestKeyType[] = ["body","query","params","headers"]

        for(const key of reqKeys){
            if(schema[key]){
                const result = schema[key].safeParse(req[key])                
                if (!result.success) {
                    return res.status(400).json({
                      meta: {
                        status: 400,
                        success: false,
                      },
                      message: "Validation failed",
                      errors: result.error.issues, 
                    });
                }
                
                req[key] = result.data
            }
        }
        next()
}}