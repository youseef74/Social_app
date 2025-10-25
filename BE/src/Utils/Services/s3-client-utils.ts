import { DeleteObjectCommand, DeleteObjectsCommand, GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

interface IS3PutObjectParams {
  Bucket: string;
  Key: string;
  Body: Buffer | string;
  ContentType: string;

}

export class s3ClientServices {
  private s3Client: S3Client;
  private key_folder: string;

  constructor() {
    this.s3Client = new S3Client({
      region: process.env.AWS_REGION as string,
      credentials: {
        accessKeyId: String(process.env.AWS_ACCESS_KEY_ID),
        secretAccessKey: String(process.env.AWS_SECRET_ACCESS_KEY),
      },
    });

    this.key_folder = process.env.AWS_KEY_FOLDER as string;
  }

  async getFileFromS3(key: string,expiresIn:number=60000){
    const getCommand = new GetObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME as string,
      Key: key,
    })
    return await getSignedUrl(this.s3Client,getCommand,{expiresIn})
  }

  async uploadFileOnS3(files: Express.Multer.File | Express.Multer.File[], key: string) {
    const bucket = process.env.AWS_BUCKET_NAME as string;
    const region = process.env.AWS_REGION as string;

    // Handle both single file and array of files
    const fileArray = Array.isArray(files) ? files : [files];
    
    const uploadPromises = fileArray.map(async (file) => {
      const key_name = `${this.key_folder}/${key}/${Date.now()}-${file.originalname}`;

      const params: IS3PutObjectParams = {
        Bucket: bucket,
        Key: key_name,
        Body: file.buffer, 
        ContentType: file.mimetype,
      };

      const putCommand = new PutObjectCommand(params);
      await this.s3Client.send(putCommand);
      
      const urlSigned = await this.getFileFromS3(key_name, 60000);
      return {
        key: key_name,
        url: urlSigned
      };
    });

    const results = await Promise.all(uploadPromises);
    
    // Return single object if single file was passed, array if multiple files
    return Array.isArray(files) ? results : results[0];
  }

  async deleteFileFromS3(key:string){
    const deleteCommand = new DeleteObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME as string,
      Key: key
    })
    await this.s3Client.send(deleteCommand)
  }

  async deleteBulkFromS3(keys:string[]){
    const deleteCommand = new DeleteObjectsCommand({
      Bucket:process.env.AWS_BUCKET_NAME as string,
      Delete:{
        Objects:keys.map(key=>({Key:key}))
      }
    })
    await this.s3Client.send(deleteCommand)
  }

  async uploadLargeFileOnS3(file: Express.Multer.File, key: string){
    const keyName = `${this.key_folder}/${key}/${Date.now()}-${file.originalname}`;
    
    const params: IS3PutObjectParams = {
      Bucket: process.env.AWS_BUCKET_NAME as string,
      Key: keyName,
      Body: file.buffer,
      ContentType: file.mimetype,
    }

    const upload = new Upload({
      client: this.s3Client,
      params: params,
      queueSize: 4,
      partSize: 10 * 1024 * 1024,
      leavePartsOnError: false,
    }) 

     upload.on('httpUploadProgress', (progress) =>{
      console.log(`uploading ${progress.loaded} of ${progress.total}`);
      
    })

    await upload.done()
  }
}
