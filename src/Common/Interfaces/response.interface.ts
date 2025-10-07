

export interface IMetaResponse{
    status:number;
    success:boolean;
}


export interface IDataResponse{
    message:string;
    data?:unknown;
}


export interface IErrorDataResponse{
    message:string,
    error?:object
}

export interface ISuccessResponse{
    meta:IMetaResponse,
    data?:IDataResponse
}

export interface IFailedResponse{
    meta:IMetaResponse,
    context?:IErrorDataResponse
}