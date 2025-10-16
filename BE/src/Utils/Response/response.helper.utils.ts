import { ISuccessResponse,IFailedResponse } from "../../Common/index.js"


export function successResponse<T>(
    message = 'Your Request is processed successfully',
    status = 200,
    data?: T
  ) {
    return {
      meta: {
        status,
        success: true,
      },
      message,
      data, 
    };
  }
  

export function failedResponse(
    message = 'Your Request is failed',
    status = 500,
    error?:object
):IFailedResponse{
    return{
        meta:{
            status,
            success:false
        },
        context:{
            message,
            error
        }
    }
}