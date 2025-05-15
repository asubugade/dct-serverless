/**
 * Config File
 * Database Connection
 * Load Config Defines
 * 
 * Below this goes the tags to further describe element you are documenting
 * @author 	mpatil <mpatil@shipco.com>
 * @copyright	WWA DCT
 * @version	1.1
 * @since  	2021-01-01
 * 
 */

import oDotenv from 'dotenv';
import oConnectDB from "./database";
import * as fs from 'fs'; 
import { GetSecretValueCommand, SecretsManagerClient } from '@aws-sdk/client-secrets-manager';
export class ClsDCT_ConfigIntigrations {
    public cMongodbURI:string;

    public cFrontEndURILocal:string;
    public cBackEndURILocal:string;
    public cJwtSecret:string;
    public cPort:string;
    public cJwtExpiration:string |any;
    public cCryptoKey:string;

    public cAWSBucket:string;
    public cAWSBucketEnv:string;
    public cAWSRegion:string;
    public AWS_IAM_ARN:string;
    public cAWSAccessKey:string;
    public cAWSSecretKey:string;
    public cAWSBucketTemplates:string;
    public cAWSBucketTemplatesImportHeader:string;
    public cAWSBucketTemplatesSampleFile:string;
    public cAWSBucketTemplatesUploadTemplate:string;
    public cAWSBucketTemplatesDistribution:string;
    public cAWSBucketTemplatesConsolidation:string;
    public cAWSBucketExportListing:string;
    public cAWSBucketProfileImage:string;
    public cAWSBucketInstructionFile:string;

    public cDir:string = __dirname;
    public cDirBasepath:string;
    public cHome : string | undefined
    public cHomeVarTemp :string
    public cDirAssetPath:string;

    //Templates Directory
    public cDirTemplatesPath:string;
    public cDirTemplateSampleFile:string;
    public cDirTemplateImportExcelToJSONHeader:string;
    public cDirTemplateUploadTemplate:string;
    public cDirTemplateMemberUploadTemplate:string;
    public cDirTemplateInterTeamUploadTemplate:string;
    //Validate Template Interteam
    public cDirValidateTemplateHeaderLevel:string;
    public cDirValidateTemplateStatusFile:string;
    //Validate Template Member
    public cDirValidateTemplateHeaderLevelMember:string;
    public cDirValidateTemplateStatusFileMember:string;
    //DistributionTemplate Template
    public cDirDistributionTemplate:string;
    //ConsolidationTemplate Template
    public cDirConsolidationTemplate:string;
    //User Directory
    public cDirProfileImagePath:string;
    //Python Scripts
    public cDirPythonPath:string;
    //Export Listing
    public cDirExportListing:string;
    //Send Instruction Email
    public cDirSendInstructionFileListing:string;
    //code added by spirgonde for additional file upload task start ...
    public cDirTemplateInterTeamUploadTemplateS3Path:string;
    public cDirTemplateMemberUploadTemplateS3Path:string;
    //code added by spirgonde for additional file upload task end .
    
    public cNotificationEmail:string;
    public cNotificationEmailPwd:string;
    public cEmailService:string;
    public cEmailHost:string;
    public cEmailPort:string;

    public cNodeEnv:any;
    public cHost:string;
    public cDBName:string;
    public cUserNameDB:string;
    public cPasswordDB:string;
    public CLOUDWATCH_GROUP :string;
    public CLOUDWATCH_ACCESS_KEY :string;
    public CLOUDWATCH_SECRET_ACCESS_KEY:string;
    public CLOUDWATCH_REGION:string;
    
    public SECRET_DATA_STRING:any;
    public SECRET_NAME:string;
    public SECRET_STRING: string;
    public SECRET_DB_PASSWORD: string;

    /**
     * Constructor will load all default configs
     */
    constructor() {
      // oDotenv.config({path: '../../.env'});
      if (process.env.NODE_ENV == "Server") {
        this.getSecretsAccess();
      }
      else if (process.env.NODE_ENV == "Local") {
        this.FunDCT_LoadConfigs(process.env); 
      }
      // this.FunDCT_LoadConfigs(process.env); 
    }

    async getSecretsAccess() {
      try {
        const client = new SecretsManagerClient({ region: process.env.AWS_REGION });
        const response:any = await client.send(
          new GetSecretValueCommand({
          SecretId: process.env.SECRET_NAME,
          }),
        );
        if (response) {
          const dataString = JSON.parse(response.SecretString);
          this.FunDCT_LoadConfigs(dataString);
          this.FunDCT_ConnectDatabase();
        }
      }
      catch (err) {
        console.log(err);
      }
    }

    /**
     * To load all default configs
     */
    public FunDCT_LoadConfigs(secretDataString) {
      
      // oDotenv.config({path: '.env'});      

        //added below variable in .env files START...
        this.cNodeEnv = secretDataString?.NODE_ENV;

        //secret-start>>>>>>>>>>>>>>>>>>>
        this.cDBName = secretDataString.cDBName;
        
        this.cUserNameDB = secretDataString.cUserNameDB;
        this.cPasswordDB = secretDataString.cPasswordDB;
        this.cHost = secretDataString.cHost;
        this.cMongodbURI = `mongodb://${this.cHost}/${this.cDBName}`;   
        //secret-end>>>>>>>>>>>>>>>>>>>
        
        //added below variable in .env files END.
        this.cHome = secretDataString?.Home
        this.cHomeVarTemp = secretDataString?.HOME_DIR
        this.cFrontEndURILocal = secretDataString?.FRONTEND_URI_LOCAL;
        this.cBackEndURILocal = secretDataString?.BACKEND_URI_LOCAL;
        this.cJwtSecret = secretDataString?.cJwtSecret;
        this.cPort = secretDataString?.PORT;
        this.cJwtExpiration = secretDataString?.cJwtExpiration;
        this.cCryptoKey = secretDataString?.cCryptoKey;

        //secret-start>>>>>>>>>>>>>>>>>>>
        this.cAWSBucket = secretDataString.AWS_BUCKET;
        this.cAWSRegion = secretDataString.AWS_REGION;
        this.cAWSAccessKey = secretDataString.AWS_ACCESS_KEY;
        this.cAWSSecretKey = secretDataString.AWS_SECRET_KEY;
        ///secret-end>>>>>>>>>>>>>>>>>>>

        this.cAWSBucketEnv = secretDataString?.AWS_BUCKET_ENV;
        this.AWS_IAM_ARN = secretDataString?.AWS_IAM_ARN;
        this.cAWSBucketTemplates = secretDataString?.AWS_BUCKET_TEMPLATES;
        this.cAWSBucketTemplatesImportHeader = secretDataString?.AWS_BUCKET_TEMPLATES_IMPORTHEADER;
        this.cAWSBucketTemplatesSampleFile = secretDataString?.AWS_BUCKET_TEMPLATES_SAMPLEFILE;
        this.cAWSBucketTemplatesUploadTemplate = secretDataString?.AWS_BUCKET_TEMPLATES_UPLOADTEMPLATE;
        this.cAWSBucketTemplatesDistribution = secretDataString?.AWS_BUCKET_TEMPLATES_DISTRIBUTION;
        this.cAWSBucketTemplatesConsolidation = secretDataString?.AWS_BUCKET_TEMPLATES_CONSOLIDATION;
        this.cAWSBucketExportListing = secretDataString?.AWS_BUCKET_EXPORT_LISTING;
        this.cAWSBucketProfileImage = secretDataString?.AWS_BUCKET_PROFILE_IMAGE;
        this.cAWSBucketInstructionFile = secretDataString?.AWS_BUCKET_INSTRUCTION_FILE;
        
        //secret-start>>>>>>>>>>>>>>>>>>>
        //Notification Email settings START..
        this.cNotificationEmail = secretDataString.NOTIFICATION_EMAIL;
        this.cNotificationEmailPwd = secretDataString.NOTIFICATION_EMAIL_PWD;
        this.cEmailService  = secretDataString.NOTIFICATION_EMAIL_SERVICE;
        this.cEmailHost = secretDataString.NOTIFICATION_EMAIL_HOST;
        this.cEmailPort = secretDataString.NOTIFICATION_EMAIL_PORT;
        //secret-end>>>>>>>>>>>>>>>>>>>

      //secret-start>>>>>>>>>>>>>>>>>>>
      //Notification Email settings END.
      this.CLOUDWATCH_GROUP = secretDataString.CLOUDWATCH_GROUP;
      this.CLOUDWATCH_ACCESS_KEY = secretDataString.CLOUDWATCH_ACCESS_KEY;
      this.CLOUDWATCH_SECRET_ACCESS_KEY = secretDataString.CLOUDWATCH_SECRET_ACCESS_KEY;
      this.CLOUDWATCH_REGION = secretDataString.CLOUDWATCH_REGION;
      //secret-end>>>>>>>>>>>>>>>>>>>
        
        //Secret Manager keys
        this.SECRET_NAME = secretDataString?.SECRET_NAME;

      if (secretDataString?.NODE_ENV == "Server") {
        //secret-start>>>>>>>>>>>>>>>>>>>
        this.cDBName = '';
        this.cUserNameDB = '';
        this.cPasswordDB = '';
        this.cHost = '';
        this.cMongodbURI = `mongodb://${this.cHost}/${this.cDBName}`;   
        //secret-end>>>>>>>>>>>>>>>>>>>

        //secret-start>>>>>>>>>>>>>>>>>>>
        this.cAWSBucket = '';
        // this.cAWSRegion = '';
        this.cAWSAccessKey = '';
        this.cAWSSecretKey = '';
        ///secret-end>>>>>>>>>>>>>>>>>>>

        //secret-start>>>>>>>>>>>>>>>>>>>
        //Notification Email settings START..
        this.cNotificationEmail = '';
        this.cNotificationEmailPwd = '';
        this.cEmailService  = '';
        this.cEmailHost = '';
        this.cEmailPort = '';
        //secret-end>>>>>>>>>>>>>>>>>>>

        //secret-start>>>>>>>>>>>>>>>>>>>
        //Notification Email settings END.
        this.CLOUDWATCH_GROUP = '';
        this.CLOUDWATCH_ACCESS_KEY = '';
        this.CLOUDWATCH_SECRET_ACCESS_KEY = '';
        this.CLOUDWATCH_REGION = '';
        //secret-end>>>>>>>>>>>>>>>>>>>
      }
        
        this.FunDCT_AccessDirDefines();
    }

    /**
     * To Access Temp Directories
     */
    public async FunDCT_AccessDirDefines() {
        this.cDirBasepath = this.cDir.replace(/\\/g, "/").replace('dist/config','');
        // this.cDirAssetPath = this.cDirBasepath + 'assets/';
        this.cDirAssetPath = this.cHomeVarTemp + 'assets/' ;

            try {
              await fs.accessSync(this.cDirAssetPath);
              
            } catch (error) {
              if (error.code === 'ENOENT') {
                await fs.mkdirSync(this.cDirAssetPath,{ recursive: true })
              } else {
                console.error('Error:', error);
              }
            }
        //User
        this.cDirProfileImagePath = this.cDirAssetPath + 'profile_image/';
        await this.FuncDCT_CheckFolderPathExist(this.cDirProfileImagePath)
        //User
        this.cDirExportListing = this.cDirAssetPath + 'export_listing/';
        await this.FuncDCT_CheckFolderPathExist(this.cDirExportListing)
        
        //Templates
        this.cDirTemplatesPath = this.cDirAssetPath + 'templates/';
        await this.FuncDCT_CheckFolderPathExist(this.cDirTemplatesPath)

        this.cDirTemplateSampleFile = this.cDirTemplatesPath + 'samplefile/';
        await this.FuncDCT_CheckFolderPathExist(this.cDirTemplateSampleFile)

        this.cDirTemplateImportExcelToJSONHeader = this.cDirTemplatesPath + 'importtoheader/';
        await this.FuncDCT_CheckFolderPathExist(this.cDirTemplateImportExcelToJSONHeader)
        
        this.cDirTemplateUploadTemplate = this.cDirTemplatesPath + 'uploadtemplate/';
        await this.FuncDCT_CheckFolderPathExist(this.cDirTemplateUploadTemplate)

        this.cDirTemplateMemberUploadTemplate = this.cDirTemplateUploadTemplate + 'member/';
        await this.FuncDCT_CheckFolderPathExist(this.cDirTemplateMemberUploadTemplate)
        
        this.cDirTemplateInterTeamUploadTemplate = this.cDirTemplateUploadTemplate + 'interteam/';
        await this.FuncDCT_CheckFolderPathExist(this.cDirTemplateInterTeamUploadTemplate)
        
        //Validate Template InterTeam
        this.cDirValidateTemplateHeaderLevel = this.cDirTemplateInterTeamUploadTemplate + 'validate_template_headerlevel_json/';
        await this.FuncDCT_CheckFolderPathExist(this.cDirValidateTemplateHeaderLevel)
        
        this.cDirValidateTemplateStatusFile = this.cDirTemplateInterTeamUploadTemplate + 'validate_template_statusfile/';
        await this.FuncDCT_CheckFolderPathExist(this.cDirValidateTemplateStatusFile)
        
        //Validate Template Member
        this.cDirValidateTemplateHeaderLevelMember = this.cDirTemplateMemberUploadTemplate + 'validate_template_headerlevel_json/';
        await this.FuncDCT_CheckFolderPathExist(this.cDirValidateTemplateHeaderLevelMember)
        
        this.cDirValidateTemplateStatusFileMember = this.cDirTemplateMemberUploadTemplate + 'validate_template_statusfile/';
        await this.FuncDCT_CheckFolderPathExist(this.cDirValidateTemplateStatusFileMember)
        
        //DistributionTemplate Template Member
        this.cDirDistributionTemplate = this.cDirTemplatesPath + 'distribution/';
        await this.FuncDCT_CheckFolderPathExist(this.cDirDistributionTemplate)

        //Consolidation Template Member
        this.cDirConsolidationTemplate = this.cDirTemplatesPath + 'consolidation/';
        await this.FuncDCT_CheckFolderPathExist(this.cDirConsolidationTemplate)
        
        //Python Scripts
        this.cDirPythonPath = this.cDirBasepath + 'src/script_files/';
        //Send Instruction Email
        this.cDirSendInstructionFileListing = this.cDirAssetPath +'instructionfile/';
        await this.FuncDCT_CheckFolderPathExist(this.cDirSendInstructionFileListing)
        
        //code added by spirgonde for additional file upload task start
        // this.cDirTemplateInterTeamUploadTemplateS3Path = this.cDirTemplateInterTeamUploadTemplate;
        // this.cDirTemplateMemberUploadTemplateS3Path    = this.cDirTemplateMemberUploadTemplate;
        this.cDirTemplateInterTeamUploadTemplateS3Path = 'assets/templates/uploadtemplate/interteam';
        this.cDirTemplateMemberUploadTemplateS3Path    = 'assets/templates/uploadtemplate/member';
        //code added by spirgonde for additional file upload task end
    }

    /**
     * To connect database
     */
    public FunDCT_ConnectDatabase() {
        return oConnectDB();
    }

    public async FuncDCT_CheckFolderPathExist(path:string){
        try {
            await fs.accessSync(path);
          } catch (error) {
            if (error.code === 'ENOENT') {
              await fs.mkdirSync(path,{ recursive: true })
            } else {
              console.error('Error:', error);
            }
          }
    }

}

export default new ClsDCT_ConfigIntigrations();