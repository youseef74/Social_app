import { httpException } from "./http-excption-utils.js";


export class badRequestException extends httpException {
    constructor(message:string, public error?:object){
        super(message,400,error)
    }
}


export class conflictException extends httpException{
    constructor(message:string, public error?:object){
        super(message,409,error)
    }
}


export class notFoundException extends httpException{
    constructor(message:string, public error?:object){
        super(message,404,error)
    }
}


export class unAuthException extends httpException{
    constructor(message:string, public error?:object){
        super(message,401,error)
    }
}