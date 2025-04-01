import {
  S3Client,
  PutObjectCommand,
  CreateBucketCommand,
  DeleteObjectCommand,
  DeleteBucketCommand,
  paginateListObjectsV2,
  GetObjectCommand, 
  PutObjectCommandInput, 
  PutObjectOutput, 
  PutObjectRequest,
  ListBucketsCommand,
  GetObjectAclCommand
} from "@aws-sdk/client-s3";
import { IAMClient, ListGroupsCommand } from "@aws-sdk/client-iam";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { ClsDCT_ConfigIntigrations } from "../config/config";
import type {Readable} from 'stream'
import { Upload } from "@aws-sdk/lib-storage";
import { cloudWatchClass } from "./cloudWatchLogger";
import { GetSecretValueCommand, SecretsManagerClient } from "@aws-sdk/client-secrets-manager";

export class S3ClientClass {
  protected iamClient: IAMClient;
  protected s3Client = new S3Client({});
  protected cConfigIntigrations = new ClsDCT_ConfigIntigrations();
  protected logger = new cloudWatchClass() 

  constructor() {
    // this.iamClient = new IAMClient({ 
    //     region: this.cConfigIntigrations.cAWSRegion,
    //     credentials: {
    //         accessKeyId: this.cConfigIntigrations.cAWSAccessKey,
    //         secretAccessKey: this.cConfigIntigrations.cAWSSecretKey
    //     }
    // });
  }
  public setStreamName(stream:string){
    this.logger.setStream(stream)
  }
  async get(key: string) {
    try {
      if (this.cConfigIntigrations.cNodeEnv == "Server") {
        
        const client = new SecretsManagerClient({ region: this.cConfigIntigrations.cAWSRegion });
        
        const response = await client.send(
          new GetSecretValueCommand({
          SecretId: this.cConfigIntigrations.SECRET_NAME,
          }),
        );
        if (response) {

          const dataString = JSON.parse(response.SecretString);

          const s3Client = new S3Client({
            region: dataString.cAWSRegion,
            credentials: {
                accessKeyId: dataString.AWS_ACCESS_KEY,
                secretAccessKey: dataString.AWS_SECRET_KEY
            }
          })

          const command = new GetObjectCommand({
            Bucket: dataString.AWS_BUCKET,
            Key: key
          });

          // const url = await getSignedUrl(this.s3Client, command);
          try {
              const response = await s3Client.send(command);

              return await response.Body.transformToByteArray();
            } 
          catch (err) {
              this.logger.error(err);
            }
          }
        }
        else{
          const s3Client = new S3Client({
            region: this.cConfigIntigrations.cAWSRegion,
            credentials: {
                accessKeyId: this.cConfigIntigrations.cAWSAccessKey,
                secretAccessKey: this.cConfigIntigrations.cAWSSecretKey
            }
          })
          const command = new GetObjectCommand({
            Bucket: this.cConfigIntigrations.cAWSBucket,
            Key: key
          });
          
          try {
            const response = await s3Client.send(command);
            return await response.Body.transformToByteArray();
          } catch (err) {
            this.logger.error(err);
          }
        }
      } catch (err) {
        this.logger.error(err);
      }
  }
  
  async put(data) {
    try {
      if (this.cConfigIntigrations.cNodeEnv == "Server") {

        const client = new SecretsManagerClient({ region: this.cConfigIntigrations.cAWSRegion });
        const response = await client.send(
          new GetSecretValueCommand({
            SecretId: this.cConfigIntigrations.SECRET_NAME,
          }),
        );
        if (response) {
          const dataString = JSON.parse(response.SecretString);
          const s3Client = new S3Client({
            region: dataString.cAWSRegion,
            credentials: {
              accessKeyId: dataString.AWS_ACCESS_KEY,
              secretAccessKey: dataString.AWS_SECRET_KEY
            }
          })
    
          const command = new PutObjectCommand({
            Bucket: dataString.AWS_BUCKET,
            Key: data.Key,
            Body: data.Body,
            ContentType: data.contentType
          });
    
          try {
            const response = await s3Client.send(command);
            return response;
          } catch (err) {
            this.logger.error(err);
          }
        }
      }
      else {
        const s3Client = new S3Client({
          region: this.cConfigIntigrations.cAWSRegion,
          credentials: {
            accessKeyId: this.cConfigIntigrations.cAWSAccessKey,
            secretAccessKey: this.cConfigIntigrations.cAWSSecretKey
          }
        })
        const command = new PutObjectCommand({
          Bucket: data.Bucket,
          Key: data.Key,
          Body: data.Body,
          ContentType: data.contentType
        });
        try {
          const response = await s3Client.send(command);
          return response;
        } catch (err) {
          this.logger.error(err);
        }
      }
    } catch (err) {
      this.logger.error(err);
    }
  }

  async uploladObj(data){
    try {
      this.s3Client = new S3Client({
        region: this.cConfigIntigrations.cAWSRegion,
        credentials: {
            accessKeyId: this.cConfigIntigrations.cAWSAccessKey,
            secretAccessKey: this.cConfigIntigrations.cAWSSecretKey
        }
      })
      const parallelUploads3 = new Upload({
        client: this.s3Client,
        params: { 
          Bucket: data.Bucket, 
          Key: data.Key,
          Body: data.Body,
          ContentType: data.contentType
        },
    
        tags: [
          /*...*/
        ], // optional tags
        // queueSize: 4, // optional concurrency configuration
        // partSize: 1024 * 1024 * 5, // optional size of each part, in bytes, at least 5MB
        // leavePartsOnError: false, // optional manually handle dropped parts
      });
    
      parallelUploads3.on("httpUploadProgress", (progress) => {
        // this.logger.log(progress);
        this.logger.log(progress);
      });
    
      return await parallelUploads3.done();
    } catch (e) {
      // this.logger.log(e);
      this.logger.log(e);
    }
  }
  

  /**
   * To create put request on S3
   * @param location string
   * @param filename string
   * @param contents string
   * @returns PutObjectRequest
   */
  public createPutPublicJsonRequest(
    location: string,
    filename: string,
    contents: any
  ) {
    const request: PutObjectRequest = {
      Bucket: location,
      Key: filename,
      Body: contents,
      ContentType: 'application/json; charset=utf-8',
      ACL: 'public-read',
      CacheControl: 'max-age=60'
    }

    return request;
  }

  public async Func_presignedUrl(key: string, filename:string) {
    try {
      if (this.cConfigIntigrations.cNodeEnv == "Server") {
        const client = new SecretsManagerClient({ region: this.cConfigIntigrations.cAWSRegion });
        
        const response = await client.send(
          new GetSecretValueCommand({
          SecretId: this.cConfigIntigrations.SECRET_NAME,
          }),
        );
        if (response) {

          const dataString = JSON.parse(response.SecretString);

          const s3Client = new S3Client({
            region: dataString.cAWSRegion,
            credentials: {
                accessKeyId: dataString.AWS_ACCESS_KEY,
                secretAccessKey: dataString.AWS_SECRET_KEY
            }
          })

          const command = new GetObjectCommand({
            Bucket: dataString.AWS_BUCKET,
            Key: key,
            ResponseContentDisposition: 'attachment; filename ="' + filename + '"'
          });

          const url = await getSignedUrl(this.s3Client, command);
          return url;
          }
        }
        else{
          const s3Client = new S3Client({
            region: this.cConfigIntigrations.cAWSRegion,
            credentials: {
                accessKeyId: this.cConfigIntigrations.cAWSAccessKey,
                secretAccessKey: this.cConfigIntigrations.cAWSSecretKey
            }
          })
          const command = new GetObjectCommand({
            Bucket: this.cConfigIntigrations.cAWSBucket,
            Key: key,
            ResponseContentDisposition: 'attachment; filename ="' + filename + '"'
          });
          
          const url = await getSignedUrl(s3Client, command);
          return url;
        }
      } catch (err) {
        this.logger.error(err);
      }
  }
  // Following code you can use in other files to access Func_presignedUrl
  // const s3ClientClass = new S3ClientClass();
  // let preSignedVar = await s3ClientClass.Func_presignedUrl(cTemplateSampleFile, "Sample.xlsx");
  // preSignedVar = btoa(preSignedVar);
}
