/**
 * Class - Common extends Configuration Class
 * 
 * Below this goes the tags to further describe element you are documenting
 * @author 	mpatil <mpatil@shipco.com>
 * @copyright	WWA DCT
 * @version	1.1
 * @since  	2021-01-01
 * 
 */

import { ClsDCT_Message } from "./Class.message";
import { ClsDCT_ConfigIntigrations } from "../config/config";
import oJwt from "jsonwebtoken";
import Payload from "../types/Payload";
import User, { IUser } from "../models/GenUser";
import GenAccessType, { IAccessType } from "../models/GenAccessType";
import { spawn } from "child_process";
import fs, { createWriteStream } from 'fs';
var mongoose = require('mongoose')
const { once } = require('events');

import { S3ClientClass } from '../middleware/aws-s3-client';
import * as path from 'path';
const oMimeType = require('mime-types');
import Template, { ITemplate } from "../models/GenTemplate";
import MemTmplUploadLog, { IMemTmplUploadLog } from "../models/MemTmplUploadLog";
import TmplMetaData, { ITmplMetaData } from "../models/Tmplmetadata";
import GenMember, { IMember } from "../models/GenMember";
import { model } from 'mongoose';
import { cloudWatchClass } from "../middleware/cloudWatchLogger";
const BufferReader = require('buffer-reader');
export class ClsDCT_Common extends ClsDCT_ConfigIntigrations {
    public cRandomUnique: string;//used for general random string

    public cModule: string;//used for Error/Success notification
    public cStatusString: string;//used for Error/Success notification
    public iStatusCode: number;//used for Error/Success notification
    public cDescription: string;//used for Error/Success notification

    public cUserID: string;//used to get current user details from token
    public cEmail: string;//used to get current user details from token
    public cUsername: string;//used to get current user details from token
    public iAccessTypeID: string;//used to get current user details from token
    public oCurrentUserDetails: IUser;//used to get current user details from token

    public _cFileExportName: any;
    public _cFileExportType: any;
    public cType: any;

    public iTemplateID: string;//used to get consolidation templateid

    public cScac: string;
    public iMemberID: string;
    public cName: string;
    public cMemberEmail: string;
    public cCurrentAPIrequest: string
    public currentStreamName: string;

    /**
     * Constructor
     */
    constructor() {
        super();
    }

    /**
     * Function to get presinged URL from s3 bucket , it requires key of the stored file as function argument.
     * Added by spirgodne.
     * @param key 
     * @returns 
     */
    public async FunDCT_getPresignedUrl(key) {
        try {
            const s3ClientClass = new S3ClientClass();
            s3ClientClass.setStreamName('/api/IMAGE_URL_PRESIGNED')
            let presignedURL = await s3ClientClass.get(key);
            return presignedURL;

        } catch (error) {
            this.log(`Error Unable to get presingened URL for ${key}`)
            return ''
        }


    }

    //code added by spirgonde for insert profile image to s3 bucket  start 
    /**
     * To upload profile Image to s3 bucket  
     */
    public async FunDCT_UploadProfileImage(file: any, filePath: any) {
        // return new Promise((resolve, reject) => {
        const contentType = oMimeType.lookup(filePath);
        const params = {
            Bucket: this.cAWSBucket, //BUCKET_NAME
            Key: filePath,
            Body: file,
            // ACL: 'public-read',
            ContentType: contentType,
        };
        const s3ClientClass = new S3ClientClass();
        s3ClientClass.setStreamName(this.currentStreamName)
        let presignedURL = await s3ClientClass.put(params);
        return filePath;
        // });
    }
    //code added by spirgonde for insert profile image to s3 bucket  end

    /**
     * To get Random
     */
    public FunDCT_GetRandomStr() {
        return this.cRandomUnique;
    }

    /**
     * To set Random
     * 
     * @param nLength number
     * @param cRandType string
     */
    public async FunDCT_SetRandomStr(nLength: number, cRandType: string) {
        cRandType = cRandType && cRandType.toLowerCase();
        var cRandResponse = "",
            iIndex = 0,
            iMin = cRandType == "calphanumeric" ? 10 : 0,
            iMax = cRandType == "inumber" ? 10 : 62;
        for (; iIndex++ < nLength;) {
            var cRandomStr = Math.random() * (iMax - iMin) + iMin << 0;
            cRandResponse += String.fromCharCode(cRandomStr += cRandomStr > 9 ? cRandomStr < 36 ? 55 : 61 : 48);
        }
        this.cRandomUnique = cRandResponse;
    }


    /**
      * To Handle response according to Module and Status String using FunDCT_MessageResponse common class function
      * @param cType string
      * @param cModule string
      * @param cStatusString string
      * @param iStatusCode number
      * @param oDetails any
      * @param req Request
      * @param res Response
      */
    public async FunDCT_Handleresponse(cType: string, cModule: string = 'FunDCT_APPERR', cStatusString: string = 'GENERIC', iStatusCode: number, oDetails: any) {
        try {
            await this.FunDCT_MessageResponse(cType, cModule, cStatusString, 401);
            if (this.cDescription) {
                return {
                    statusCode: iStatusCode,
                    body: JSON.stringify({
                        cModule: "APPLICATION",
                        cMessage: this.cDescription || "Success",
                        cDetails: oDetails,
                        cType: cType,
                    }),
                };
            }
        } catch (err) {
            return {
                statusCode: iStatusCode,
                body: JSON.stringify({
                    cModule: "UNKNOWN_MODULE",
                    cErrorMessage: "Please contact the support team for this issue.",
                    cDetails: "UNKNOWN_DETAILS",
                }),
            };
        }
    }



    /**
     * To get Succcess/Error Message From Message Collection
     * @param cType string
     * @param cModule string
     * @param cStatusString string
     * @param iStatusCode number
     * @param cDescription string
     */
    public async FunDCT_MessageResponse(cType: string, cModule: string = 'FunDCT_APPERR', cStatusString: string = 'GENERIC', iStatusCode: number = 400, cDescription: string = 'BadRequest') {
        try {
            let ostatusclass = new ClsDCT_Message();
            this.cStatusString = cStatusString;
            this.iStatusCode = iStatusCode;
            this.cDescription = cDescription;
            ostatusclass.FunDCT_setModuleCode(cModule);
            ostatusclass.FunDCT_setMessageCode(cStatusString);
            let oGetMessageDetails = await ostatusclass.FunDCT_setMessageDetails();

            if (oGetMessageDetails) {
                this.cStatusString = oGetMessageDetails[0]['cMessageCode'];
                this.iStatusCode = oGetMessageDetails[0]['cModuleCode'];
                this.cDescription = oGetMessageDetails[0]['cDescription'];

            }
        } catch (oErr) {
        ;

            this.error(oErr.message);
            // process.exit(1);
        }
    }

    /**
     * To get UserID:_id
     */
    public FunDCT_getUserID() {
        return this.cUserID;
    }

    /**
     * To set UserID:_id
     */
    public FunDCT_setUserID(cUserID: string) {
        this.cUserID = cUserID;
    }

    /**
     * To get Email:cEmail
     */
    public FunDCT_getEmail() {
        return this.cEmail;
    }

    /**
     * To set Email:cEmail
     */
    public FunDCT_setEmail(cEmail: string) {
        this.cEmail = cEmail;
    }

    /**
     * To get Username:cUsername
     */
    public FunDCT_getUsername() {
        return this.cUsername;
    }

    /**
     * To set Username:cUsername
     */
    public FunDCT_setUsername(cUsername: string) {
        this.cUsername = cUsername;
    }

    /**
     * To get Username:cUsername
     */
    public async FunDCT_GetAccessType() {
        return await GenAccessType.find({ "_id": this.iAccessTypeID }).select('cAccessCode');
    }


    /**
     * To get current user details based on Token
     */
    public FunDCT_getUserDetails() {
        return this.oCurrentUserDetails;
    }

    /**
     * To set user details
     * oCurrentUserDetails : IUSer
     */
    public async FunDCT_setUserDetails(oCurrentUserDetails: IUser) {
        this.oCurrentUserDetails = oCurrentUserDetails
    }


    /**
     * To set Username:cUsername
     */
    public FunDCT_SetAccessType(iAccessTypeID) {
        this.iAccessTypeID = iAccessTypeID
    }

    /**
     * To Set Current User Details
     * @param cToken string
     */
    public async FunDCT_SetCurrentUserDetails(cToken: any) {
        try {
            const oPayload: Payload | any = oJwt.verify(cToken, this.cJwtSecret);
            let oCurrentUserDetails: IUser = await User.findOne({ _id: oPayload._id });
            this.FunDCT_SetAccessType(oCurrentUserDetails.iAccessTypeID);//added by stewari
            this.FunDCT_setEmail(oCurrentUserDetails.cEmail);
            this.FunDCT_setUserID(oCurrentUserDetails._id);
            this.FunDCT_setUsername(oCurrentUserDetails.cUsername);
            this.FunDCT_setUserDetails(oCurrentUserDetails);
        } catch (oErr) {
            this.error(oErr.message);
            // process.exit(1);
        }
    }

    /**
     * To Set Current User Details by ID
     * @param cId string
     */
    public async FunDCT_SetCurrentUserDetailsByID(cId) {
        try {
            let oCurrentUserDetails: IUser = await User.findOne({ '_id': new mongoose.Types.ObjectId(cId) });

            this.FunDCT_setEmail(oCurrentUserDetails.cEmail);
            this.FunDCT_setUserID(oCurrentUserDetails._id);
            this.FunDCT_setUsername(oCurrentUserDetails.cUsername);
            this.FunDCT_setUserDetails(oCurrentUserDetails);
        } catch (oErr) {
            this.error(oErr.message);
            // process.exit(1);
        }
    }

    /**
     * To Set Member Details by ID
     * @param cId string
     */
    public async FunDCT_SetMemberDetailsByScac(cScac) {
        try {
            let oMemberDetails: IMember = await GenMember.findOne({ 'cScac': cScac });
            this.FunDCT_SetScac(oMemberDetails.cScac);
            this.FunDCT_SetMemberID(oMemberDetails._id);
            this.FunDCT_SetMembername(oMemberDetails.cName);
            this.FunDCT_SetMemberEmail(oMemberDetails.cEmail);
        } catch (oErr) {
            this.error(oErr.message);
            // process.exit(1);
        }
    }


    /**
     * To get cScac
     */
    public FunDCT_GetScac() {
        return this.cScac;
    }

    /**
     * To set cScac:string
     */
    public FunDCT_SetScac(cScac: string) {
        this.cScac = cScac;
    }


    /**
     * To get iMemberID
     */
    public FunDCT_GetMemberID() {
        return this.iMemberID;
    }

    /**
     * To set iMemberID:string
     */
    public FunDCT_SetMemberID(iMemberID: string) {
        this.iMemberID = iMemberID;
    }


    /**
     * To get cName
     */
    public FunDCT_GetMembername() {
        return this.cName;
    }

    /**
     * To set cName:string
     */
    public FunDCT_SetMembername(cName: string) {
        this.cName = cName;
    }


    /**
     * To get cMemberEmail
     */
    public FunDCT_GetMemberEmail() {
        return this.cMemberEmail;
    }

    /**
     * To set cMemberEmail:string
     */
    public FunDCT_SetMemberEmail(cMemberEmail: string) {
        this.cMemberEmail = cMemberEmail;
    }







    /**
     * To get cType
     */
    public FunDCT_GetType() {
        return this.cType;
    }

    /**
     * To set cType:string
     */
    public FunDCT_SetType(cType: string) {
        this.cType = cType;
    }

    /**
     * Function to get schema from Moongoose and Add necessary Columns or Remove unnecessary columns for Export listing Header.
     * @param cType 
     * @returns 
     */
    public async FunDCT_getExportSchema(cType) {
        let aSchemafiltered, Schema;
        switch (cType) {

            case "USER":
                Schema = Object.keys(model('gen_users').schema.paths);
                aSchemafiltered = Schema.filter(elem => (elem !== '_id' && elem !== '__v' && elem !== 'iEnteredby' && elem !== 'iUpdatedby'
                    && elem !== 'cPassword' && elem !== 'iStatusID' && elem != 'iAccessTypeID' && elem != 'cPwdToken' && elem !== 'cTemplateType' && elem != 'tEntered'
                    && elem !== 'tUpdated' && elem !== 'passwordHistory'));
                aSchemafiltered.unshift("cAccessCode");//add element at start of array
                aSchemafiltered.push('cTemplateTypeListing', "tEntered", "cEnteredby", "tUpdated", "cUpdatedby", 'cStatus');
                break;

            case "MEMBER_RESTRICTION":
                Schema = Object.keys(model('tmpl_memberrestrictions').schema.paths);
                aSchemafiltered = Schema.filter(elem => (elem !== '_id' && elem !== '__v' && elem !== 'iEnteredby' && elem !== 'iUpdatedby'
                    && elem !== 'iStatusID' && elem != 'tEntered' && elem !== 'tUpdated'));
                aSchemafiltered.push("tEntered", "cEnteredby", "tUpdated", "cUpdatedby", 'cStatus');
                break;

            case "MESSAGE":
                Schema = Object.keys(model('gen_messages').schema.paths);
                aSchemafiltered = Schema.filter(elem => (elem !== '_id' && elem !== '__v' && elem !== 'iEnteredby' && elem !== 'iUpdatedby'
                    && elem !== 'iStatusID' && elem != 'tEntered' && elem !== 'tUpdated'));
                aSchemafiltered.push("tEntered", "cEnteredby", "tUpdated", "cUpdatedby", 'cStatus');
                break;

            case "VALIDATION_RULE":
                Schema = Object.keys(model('gen_templatevalidations').schema.paths);
                aSchemafiltered = Schema.filter(elem => (elem !== '_id' && elem !== '__v' && elem !== 'iEnteredby' && elem !== 'iUpdatedby'
                    && elem !== 'iStatusID' && elem !== 'cTemplateType' && elem != 'tEntered' && elem !== 'tUpdated'));
                aSchemafiltered.push('cTemplateTypeListing', "tEntered", "cEnteredby", "tUpdated", "cUpdatedby", 'cStatus');
                break;

            case "EMAIL_TEMPLATES":
                Schema = Object.keys(model('gen_emailtemplates').schema.paths);
                aSchemafiltered = Schema.filter(elem => (elem !== '_id' && elem !== '__v' && elem !== 'iEnteredby' && elem !== 'iUpdatedby'
                    && elem !== 'cBcc' && elem !== 'cEmailBody' && elem !== 'iProcessID' && elem != 'tEntered' && elem !== 'tUpdated'));

                aSchemafiltered.unshift("cProcessCode");//add element at start of array    
                aSchemafiltered.push("cEnteredby", "tEntered", "cUpdatedby", "tUpdated",);

                break;

            case "ACCESS_TYPE":
                Schema = Object.keys(model('gen_accesstypes').schema.paths);
                aSchemafiltered = Schema.filter(elem => (elem !== '_id' && elem !== '__v' && elem !== 'iEnteredby' && elem !== 'iUpdatedby'
                    && elem !== 'iStatusID' && elem != 'tEntered' && elem !== 'tUpdated'));
                aSchemafiltered.push("cStatus", "cEnteredby", "tEntered", "cUpdatedby", "tUpdated");
                break;

            case "PERMISSION":
                Schema = Object.keys(model('gen_permissions').schema.paths);
                aSchemafiltered = Schema.filter(elem => (elem !== '_id' && elem !== '__v' && elem !== 'iEnteredby' && elem !== 'iUpdatedby'
                    && elem !== 'iStatusID' && elem !== 'iAccessTypeID' && elem !== 'iProcessID' && elem != 'tEntered' && elem !== 'tUpdated'));

                aSchemafiltered.unshift("cAccessCode", "cProcessCode",);//add element at start of array 
                aSchemafiltered.push("tEntered", "cEnteredby", "tUpdated", "cUpdatedby", "cStatus");
                break;

            case "MEMBER":
                Schema = Object.keys(model('gen_members').schema.paths);
                aSchemafiltered = Schema.filter(elem => (elem !== '_id' && elem !== '__v' && elem !== 'iEnteredby' && elem !== 'iUpdatedby'
                    && elem !== 'iStatusID' && elem !== 'cTemplateType' && elem != 'tEntered'
                    && elem !== 'cAlliance' && elem !== 'cCarrierStatus' && elem != 'tUpdated'));

                aSchemafiltered.push('cTemplateTypeListing', "tEntered", "cEnteredby", "tUpdated", "cUpdatedby", "cStatus");
                break;

            case "ADDITIONAL_FIELDS":
                Schema = Object.keys(model('gen_additionalfields').schema.paths);
                aSchemafiltered = Schema.filter(elem => (elem !== '_id' && elem !== '__v' && elem !== 'iEnteredby' && elem !== 'iUpdatedby'
                    && elem !== 'iStatusID' && elem != 'tEntered' && elem !== 'tUpdated'));

                aSchemafiltered.push("tEntered", "cEnteredby", "tUpdated", "cUpdatedby", "cStatus");
                break;

            case "REGION":
                Schema = Object.keys(model('gen_regions').schema.paths);
                aSchemafiltered = Schema.filter(elem => (elem !== '_id' && elem !== '__v' && elem !== 'iEnteredby' && elem !== 'iUpdatedby'
                    && elem !== 'iStatusID' && elem != 'tEntered' && elem !== 'tUpdated'));

                aSchemafiltered.push("tEntered", "cEnteredby", "tUpdated", "cUpdatedby", "cStatus");
                break;

            case "COUNTRY":
                Schema = Object.keys(model('gen_countries').schema.paths);
                aSchemafiltered = Schema.filter(elem => (elem !== '_id' && elem !== '__v' && elem !== 'iEnteredby' && elem !== 'iUpdatedby'
                    && elem !== 'iStatusID' && elem !== 'iRegionID' && elem != 'tEntered' && elem !== 'tUpdated' && elem !== 'cDefaultcountry'));

                aSchemafiltered.push("cDefaultcountry", "cStatus", "cEnteredby", "tEntered", "cUpdatedby", "tUpdated");
                break;

            case "LOCATIONS":
                Schema = Object.keys(model('gen_locations').schema.paths);
                aSchemafiltered = Schema.filter(elem => (elem !== '_id' && elem !== '__v' && elem !== 'iEnteredby' && elem !== 'iUpdatedby'
                    && elem !== 'iStatusID' && elem != 'tEntered' && elem !== 'tUpdated'));

                aSchemafiltered.push("tEntered", "cEnteredby", "tUpdated", "cUpdatedby", "cStatus");
                break;

            case "PROCESS":
                Schema = Object.keys(model('gen_processes').schema.paths);
                aSchemafiltered = Schema.filter(elem => (elem !== '_id' && elem !== '__v' && elem !== 'iEnteredby' && elem !== 'iUpdatedby'
                    && elem !== 'iStatusID' && elem != 'tEntered' && elem !== 'tUpdated' && elem !== 'bConfigurable'));

                aSchemafiltered.push("cStatus", "cEnteredby", "tEntered", "cUpdatedby", "tUpdated");
                break;

            case "STATUS":
                Schema = Object.keys(model('gen_Status').schema.paths);
                aSchemafiltered = Schema.filter(elem => (elem !== '_id' && elem !== '__v' && elem !== 'iEnteredby' && elem !== 'iUpdatedby'
                    && elem != 'tEntered' && elem !== 'tUpdated'));

                aSchemafiltered.push("tEntered", "cEnteredby", "tUpdated", "cUpdatedby");
                break;

            case "CURRENCY":
                Schema = Object.keys(model('gen_currencies').schema.paths);
                aSchemafiltered = Schema.filter(elem => (elem !== '_id' && elem !== '__v' && elem !== 'iEnteredby' && elem !== 'iUpdatedby'
                    && elem !== 'iStatusID' && elem != 'tEntered' && elem !== 'tUpdated'));

                aSchemafiltered.push("tEntered", "cEnteredby", "tUpdated", "cUpdatedby", "cStatus");
                break;

            case "CHARGECODE":
                Schema = Object.keys(model('gen_chargecodes').schema.paths);
                aSchemafiltered = Schema.filter(elem => (elem !== '_id' && elem !== '__v' && elem !== 'iEnteredby' && elem !== 'iUpdatedby'
                    && elem !== 'iStatusID' && elem != 'tEntered' && elem !== 'tUpdated'));

                aSchemafiltered.push("tEntered", "cEnteredby", "tUpdated", "cUpdatedby", "cStatus");
                break;

            case "RATE_BASIS":
                Schema = Object.keys(model('gen_basises').schema.paths);
                aSchemafiltered = Schema.filter(elem => (elem !== '_id' && elem !== '__v' && elem !== 'iEnteredby' && elem !== 'iUpdatedby'
                    && elem !== 'iStatusID' && elem != 'tEntered' && elem !== 'tUpdated'));

                aSchemafiltered.push("tEntered", "cEnteredby", "tUpdated", "cUpdatedby", "cStatus");
                break;

            case "CARRIER":
                Schema = Object.keys(model('gen_carriers').schema.paths);
                aSchemafiltered = Schema.filter(elem => (elem !== '_id' && elem !== '__v' && elem !== 'iEnteredby' && elem !== 'iUpdatedby'
                    && elem !== 'iStatusID' && elem != 'tEntered' && elem !== 'tUpdated'));

                aSchemafiltered.push("tEntered", "cEnteredby", "tUpdated", "cUpdatedby", "cStatus");
                break;

            case "TEMPLATE_TYPE":
                Schema = Object.keys(model('gen_template_types').schema.paths);
                aSchemafiltered = Schema.filter(elem => (elem !== '_id' && elem !== '__v' && elem !== 'iEnteredby' && elem !== 'iUpdatedby'
                    && elem != 'tEntered' && elem !== 'tUpdated' && elem != 'iEnteredby' && elem !== 'iUpdatedby'));

                aSchemafiltered.push("tEntered", "tUpdated");
                break;

            case "CUSTOMER":
                Schema = Object.keys(model('gen_customers').schema.paths);
                aSchemafiltered = Schema.filter(elem => (elem !== '_id' && elem !== '__v' && elem !== 'iEnteredby' && elem !== 'iUpdatedby'
                    && elem !== 'iStatusID' && elem != 'tEntered' && elem !== 'tUpdated' && elem !== 'cTemplateType'));

                aSchemafiltered.push("cTemplateTypeListing", "tEntered", "cEnteredby", "tUpdated", "cUpdatedby", "cStatus");
                break;

            case "LIST_TEMPLATE":
                Schema = Object.keys(model('gen_templates').schema.paths);
                aSchemafiltered = Schema.filter(elem => (elem !== '_id' && elem !== '__v' && elem !== 'iEnteredby'
                    && elem !== 'iUpdatedby' && elem !== 'iStatusID' && elem !== 'cUploadedFile' && elem !== 'cTemplateSampleFile'
                    && elem != 'tEntered' && elem !== 'tUpdated' && elem !== 'iTempActiveStatus' && elem !== 'cAddtionalFile'));

                aSchemafiltered.push("tCuttoffdate", "cStatus", "tEntered", "cEnteredby", "tUpdated", "cUpdatedby");
                break;

            case "MEMBER_TEMPLATE_LIST":
                Schema = Object.keys(model('gen_templates').schema.paths);
                aSchemafiltered = Schema.filter(elem => (elem !== '_id' && elem !== '__v' && elem !== 'iEnteredby'
                    && elem !== 'iUpdatedby' && elem !== 'iStatusID' && elem !== 'cUploadedFile' && elem !== 'cTemplateSampleFile'
                    && elem != 'tEntered' && elem !== 'tUpdated' && elem !== 'iTempActiveStatus' && elem !== 'cAddtionalFile'));

                aSchemafiltered.push("tCuttoffdate", "cStatus", "tEntered", "cEnteredby", "tUpdated", "cUpdatedby");
                break;

            case "EMAIL_FREQUENCY":
                Schema = Object.keys(model('tmpl_reminderemailfreqs').schema.paths);
                aSchemafiltered = Schema.filter(elem => (elem !== '_id' && elem !== '__v' && elem !== 'iEnteredby' && elem !== 'iUpdatedby'
                    && elem !== 'iStatusID' && elem !== 'iProcessID' && elem != 'tEntered' && elem !== 'tUpdated'));

                aSchemafiltered.unshift("cProcessCode",);//add element at start of array     
                aSchemafiltered.push("tEntered", "cEnteredby", "tUpdated", "cUpdatedby", "cStatus");
                break;

            case "TEMPLATE_UPLOAD_LOG":
                Schema = Object.keys(model('tmpl_uploadlogs').schema.paths);
                aSchemafiltered = Schema.filter(elem => (elem !== '_id' && elem !== '__v' && elem !== 'iEnteredby' && elem !== 'iMemberID'
                    && elem !== 'iUpdatedby' && elem !== 'iStatusID' && elem !== 'iTemplateID' && elem !== 'cTemplateFile' && elem !== 'cScacCode'
                    && elem !== 'cSelectedMembers' && elem !== 'cTemplateStatusUploadedFile' && elem !== 'cTemplateFile'
                    && elem !== 'cUploadedFile' && elem !== 'cDistributionDetails' && elem !== 'cTemplateStatusFile'
                    && elem != 'tEntered' && elem !== 'tUpdated' && elem != 'cAddtionalFile' && elem != 'startHeaderRowIndex'
                    && elem != 'iMaxDepthHeaders' && elem != 'bProcesslock' && elem != 'bProcessed' && elem != 'isRateExtendMode'
                    && elem != 'cUploadType' && elem != 'tProcessStart' && elem != 'tProcessEnd' && elem != 'cExceptionDetails'
                    && elem != 'iActiveStatus'));

                aSchemafiltered.push("cUploadedBy", "tEntered", "tProcessStart", "tProcessEnd");
                // aSchemafiltered.splice(3,0,"cEnteredby")
                break;

            // case "MEMBER_UPLOAD_LOG":
            //     Schema = Object.keys(model('mem_uploadlogs').schema.paths);
            //     aSchemafiltered = Schema.filter(elem => (elem !== '_id' && elem !== '__v' && elem !== 'iEnteredby' && elem !== 'iMemberID'
            //         && elem !== 'iUpdatedby' && elem !== 'iStatusID' && elem !== 'iTemplateID' && elem !== 'cTemplateFile'
            //         && elem !== 'cScacCode' && elem !== 'iMemberID' && elem !== 'cTemplateStatusFile' && elem !== 'cAddtionalComment'
            //         && elem !== 'cUploadedFile' && elem !== 'cTemplateStatusUploadedFile' && elem !== 'cUploadStatus'
            //         && elem != 'tEntered' && elem !== 'tUpdated' && elem != 'cAddtionalFile'));

            //     aSchemafiltered.push("cAddtionalFile", "tEntered", "cEnteredby", "tUpdated", "cUpdatedby", "cStatus");
            //     break;
            case "MEMBER_UPLOAD_LOG":
                Schema = Object.keys(model('mem_uploadlogs').schema.paths);
                aSchemafiltered = Schema.filter(elem => (elem !== '_id' && elem !== '__v' && elem !== 'iMemberID'
                    && elem !== 'iUpdatedby' && elem !== 'iStatusID' && elem !== 'iTemplateID' && elem !== 'cTemplateFile'
                    && elem !== 'cScacCode' && elem !== 'iMemberID' && elem !== 'cTemplateStatusFile'
                    && elem !== 'cUploadedFile' && elem !== 'cTemplateStatusUploadedFile' && elem !== 'cUploadStatus'
                    && elem !== 'tUpdated' && elem != 'cAddtionalFile' && elem != 'cAddtionalComment' && elem != 'cExceptionDetails'
                    && elem != 'bProcesslock' && elem != 'bProcessed' && elem != 'isRateExtendMode'
                    && elem != 'cUploadType' && elem != 'tProcessStart' && elem != 'tProcessEnd' && elem != 'iEnteredby'
                    && elem != 'tEntered' && elem != 'iActiveStatus'));

                aSchemafiltered.push("cUploadedBy", "cScacCode", "tEntered", "tProcessStart", "tProcessEnd");
                break;

            case "CONSOLIDATE":
                Schema = Object.keys(model('tmpl_consolidationreqs').schema.paths);
                aSchemafiltered = Schema.filter(elem => (elem !== '_id' && elem !== '__v' && elem !== 'iEnteredby' && elem !== 'iUpdatedby'
                    && elem != 'iTemplateID' && elem != 'cTemplateStatusFile' && elem != 'cTemplateStatusUploadedFile'
                    && elem !== 'iStatusID' && elem != 'tEntered' && elem !== 'tUpdated' && elem !== 'IsConsolidationRequested'));

                aSchemafiltered.push("tEntered", "cEnteredby", "cStatus");
                break;

            case "MEMBER_SUBMISSION_TEMPLATE_LOGS":
                Schema = Object.keys(model('tmpl_membersubmissiondownloadlogs').schema.paths);
                aSchemafiltered = Schema.filter(elem => (elem !== '_id' && elem !== '__v' && elem !== 'iEnteredby' && elem !== 'iUpdatedby'
                    && elem != 'iTemplateID' && elem != 'cTemplateStatusFile' && elem != 'cTemplateStatusUploadedFile'
                    && elem !== 'iStatusID' && elem != 'tEntered' && elem !== 'tUpdated' && elem !== 'IsConsolidationRequested'));

                aSchemafiltered.push("tEntered", "cEnteredby", "cStatus");
                break;

        }

        return aSchemafiltered
    }

    /**
     * Function For Creating a static header which can be then user as Header row for Export Listing By returning a static header.
     * @param cType 
     * @returns 
     */
    FuncDCT_ExportStaticHeader(cType) {
        let aStaticHeader
        switch (cType) {
            case "USER":
                aStaticHeader = ["Access Type", "Email", "Avtar", "Name", "User Name", "Member Name", "Address", "City", "Postal Code",
                    "State", "Phone", "Fax", "Template Types", "Time Entered", "Entered By", "Time Updated", "Updated By", "Status"];
                break;

            case "MEMBER_RESTRICTION":
                aStaticHeader = ["Restricted Type", "Template Type", "Allowed Member Code", "Restricted Member Code", "Exception Message",
                    "Time Entered", "Entered By", "Time Updated", "Updated By", "Status"];
                break;

            case "MESSAGE":
                aStaticHeader = ["Module Code", "Message Code", "Description", "Time Entered", "Entered By", "Time Updated", "Updated By",
                    "Status"];
                break;

            case "VALIDATION_RULE":
                aStaticHeader = ["Validation Rule", "Validation Description", "Validation Regex", "Conditional Type", "Conditional State", "Template Types", "Time Entered",
                    "Entered By", "Time Updated", "Updated By", "Status"];
                break;

            case "EMAIL_TEMPLATES":
                aStaticHeader = ["Process", "Type", "Subject", "From Email Text", "From", "Status", "Entered By", "Time Entered"
                    , "Updated By", "Time Updated"];
                break;

            case "ACCESS_TYPE":
                aStaticHeader = ["Access Code", "Access Name", "Access Description", "Status", "Entered By", "Time Entered", "Updated By",
                    "Time Updated"];
                break;

            case "PERMISSION":
                aStaticHeader = ["Access Type", "Process Code", "Add", "Edit", "View", "Delete", "Time Entered", "Entered By",
                    "Time Updated", "Updated By", "Status"];
                break;

            case "MEMBER":
                aStaticHeader = ["Member Code", "Name", "Address", "City", "State", "Postal Code", "Continent", "Telephone", "Fax",
                    "Email", "Contact Person", "Location Code", "Web Page", "Type", "Template Type", "Time Entered",
                    "Entered By", "Time Updated", "Updated By", "Status"];
                break;

            case "ADDITIONAL_FIELDS":
                aStaticHeader = ["Additional Field Text", "Additional Field Value", "Selection Type", "Time Entered", "Entered By",
                    "Time Updated", "Updated By", "Status"];
                break;

            case "REGION":
                aStaticHeader = ["Region Code", "Region Name", "Template Types", "Time Entered", "Entered By", "Time Updated", "Updated By",
                    "Status"];
                break;

            case "COUNTRY":
                aStaticHeader = ["Country Code", "Country Name", "Currency Code", "Default Currency", "Status", "Entered By", "Time Entered"
                    , "Updated By", "Time Updated"];
                break;

            case "LOCATIONS":
                aStaticHeader = ["City Code", "City Name", "Country Code", "Time Entered", "Entered By", "Time Updated", "Updated By",
                    "Status"];
                break;

            case "PROCESS":
                aStaticHeader = ["Process Code", "Process Name", "Process Description", "Status", "Entered By", "Time Entered", "Updated By",
                    "Time Updated"];
                break;

            case "STATUS":
                aStaticHeader = ["Status Code", "Status Name", "Status Description", "Time Entered", "Entered By", "Time Updated",
                    "Updated By"];
                break;

            case "CURRENCY":
                aStaticHeader = ["Currency Code", "Currency Name", "Currency Symbol", "Currency Type", "Comment", "Time Entered", "Entered By",
                    "Time Updated", "Updated By", "Status"];
                break;

            case "CHARGECODE":
                aStaticHeader = ["Charge Code", "Charge Code Name", "Charge Code Group", "Default", "Time Entered", "Entered By",
                    "Time Updated", "Updated By", "Status"];
                break;

            case "RATE_BASIS":
                aStaticHeader = ["Rate Basis", "Basis Code", "Basis Name", "Comment", "Basis Group ID", "Global Conversion", "RFQ Conversion",
                    "Inland", "Time Entered", "Entered By", "Time Updated", "Updated By", "Status"];
                break;

            case "CARRIER":
                aStaticHeader = ["Carrier Company", "Carrier Name", "Address", "City", "State", "Postal Code", "Continent", "Telephone", "Fax",
                    "Carrier Email", "Contact Person", "Location Code", "Web Page", "Time Entered", "Entered By", "Time Updated",
                    "Updated By", "Status"];
                break;

            case "TEMPLATE_TYPE":
                aStaticHeader = ["Template Type", "Template description", "Status", "PreFill Data", "Time Entered", "Time Updated"];
                break;

            case "CUSTOMER":
                aStaticHeader = ["Alias Code", "Alias Name", "Customer Type", "Template Type", "Time Entered", "Entered By", "Time Updated", "Updated By",
                    "Status"];
                break;

            case "EMAIL_FREQUENCY":
                aStaticHeader = ["Process Code", "Hour", "Minute", "From", "Time Entered", "Entered By", "Time Updated", "Updated By",
                    "Status"];
                break;

            case "LIST_TEMPLATE":
                aStaticHeader = ["Template Name", "Template Type", "Template ID", "Cutoff", "Status", "Time Entered", "Entered By", "Time Updated", "Updated By",
                ];
                break;

            case "MEMBER_TEMPLATE_LIST":
                aStaticHeader = ["Template Name", "Template Type", "Template ID", "Cutoff", "Status", "Time Entered", "Entered By", "Time Updated", "Updated By"];
                break;

            case "TEMPLATE_UPLOAD_LOG":
                aStaticHeader = ["Template Name", "Template File Name", "Template File Size", "File Status",
                    "Uploaded By", "Upload AT (GMT)", "Process START AT (GMT)", "Process END AT (GMT)"];
                break;

            // case "MEMBER_UPLOAD_LOG":
            //     aStaticHeader = ["Template Name", "Template File Name", "Template File Size", "Uploaded By", "Exception Details", "Upload Type", "Exception Found", "Process Lock", "Is Processed",
            //         "Process START AT (GMT)", "Process END AT (GMT)", "Additional File", "Additional Comment", "Time Entered", "Entered By",
            //         "Time Updated", "Updated By", "Status"];
            //     break;
            case "MEMBER_UPLOAD_LOG":
                aStaticHeader = [
                    "Template Name", "File Name", "File Size", "File Status", "Upload By", "Member Code", "Uploaded AT (GMT)",
                    "Process START AT (GMT)", "Process END AT (GMT)"];
                break;

            case "CONSOLIDATE":
                aStaticHeader = ["Template Name", "Exception Details", "Process Lock", "Is Processed", "Process START AT (GMT)",
                    "Process END AT (GMT)", "Request Type", "Time Entered", "Entered By", "Status"];
                break;

            case "MEMBER_SUBMISSION_TEMPLATE_LOGS":
                aStaticHeader = ["Template Name", "Exception Details", "Process Lock", "Is Processed", "Process START AT (GMT)",
                    "Process END AT (GMT)", "Member Code", "Time Entered", "Entered By", "Status"];
                break;
        }

        return aStaticHeader
    }

    /**
     * To Export File
     * @returns 
     */
    public async FunDCT_exportDetails(cSearchFilterQuery, oSort, oReq, cTemplateTypes) {
        try {
            this.FunDCT_ApiRequest(oReq)
            const cTokenNew = oReq.header("x-wwadct-token");
            const oPayload: Payload | any = oJwt.verify(cTokenNew, this.cJwtSecret);
            let oCurrentUserDetails: IUser = await User.findOne({ _id: oPayload._id });
            let userId = oCurrentUserDetails._id
            this._cFileExportName = 'List' + '-' + Date.now() + '.xlsx';
            fs.writeFileSync(this.cDirExportListing + this._cFileExportName, '')
            let aSchemafiltered = await this.FunDCT_getExportSchema(this.cType)
            let aStaticHeader = await this.FuncDCT_ExportStaticHeader(this.cType);

            const oParams = {
                'cDirFile': this.cDirExportListing, 'cFileName': this._cFileExportName,
                'cFileType': this._cFileExportType, 'cUserID': userId, 'cType': this.cType,
                'Schema': aSchemafiltered, 'aStaticHeader': aStaticHeader, "cTemplateTypes": cTemplateTypes,
                'cSearchFilterQuery': cSearchFilterQuery, 'oSort': oSort,
            };

            const cScript = this.cDirPythonPath + 'ExportListing.py';
            const oPyArgs = [cScript, JSON.stringify(oParams)]
            const oCreateFile = spawn(process.env.PYTHON_PATH, oPyArgs);
            let oResPyProg: any;
            oCreateFile.stdout.on('data', function (data) {
                // oResPyProg = JSON.parse(data.toString('utf8'))
                try {
                    oResPyProg = JSON.parse(data.toString('utf8'));
                } catch (error) {
                    oResPyProg = undefined;
                }
            });
            // oCreateFile.stderr.on('data', (data) => {
            //     oResPyProg += JSON.stringify(data.toString('utf8'))
            // });
            oCreateFile.stderr.on('error', (data) => {
                oResPyProg = undefined
            });
            oCreateFile.stderr.on('data', (data) => {
                let bufferData = new BufferReader(data)
                // let __nBytes = bufferData.restAll()
                let iLength = bufferData.buf.length
                let arr = [];
                for (let index = 1; index < iLength; index++) {
                    try {
                        arr.push(bufferData.nextString(index))
                    } catch (error) {
                        arr.push('')
                    }
                }
                console.log(arr.join(''));
                this.log(arr.join(''))
                // oResPyProg += JSON.parse(data.toString('utf8'))
            });

            await once(oCreateFile, 'close');

            return oResPyProg;
        } catch (oErr) {
            this.error(oErr.message);
            // process.exit(1);
        }
    }

    /**
     * To Download S3 File
     * @param cUrl string
     * @returns string
     */
    public async FunDCT_DownloadS3File(cUrl: string) {
        try {
            const s3ClientClass = new S3ClientClass();
            s3ClientClass.setStreamName(this.currentStreamName)
            let oDataStream: any = await s3ClientClass.get(cUrl);            
            if (oDataStream) {

                // const downloadPath = this.cDirTemplateSampleFile + 'SampleFile.xlsx';

                // fs.writeFileSync(this.cDirTemplateSampleFile + 'SampleFile.xlsx', oDataStream);

                return oDataStream;
            }
        } catch (oErr) {
            this.error(oErr.message);
            // process.exit(1);
        }
    }

    public async FunDCT_DownloadS3FileEmailLink(cUrl: string) {
        try {
            let cTemplateName = '';
            let cMemberScac = '';
            let fullTemplateName = '';
            let iTemplateID = '';
            let memberID = '';
            let userId = '';
            let uploadLogID = '';
            let regex;
            let memberName = '';
            let memberUploadLogId = '';

            const paths = [
                {
                    requiredPath: '/templates/uploadtemplate/member/validate_template_statusfile/',
                    fileNamePrefix: 'VALIDATE_TEMPLATE-STATUSFILE-',
                    memberIDIndex: 3 // memberID is found at the 3rd capture group
                },
                {
                    requiredMemberPath: '/templates/uploadtemplate/interteam/validate_template_statusfile/',
                    fileNamePrefix: 'VALIDATE_TEMPLATE-STATUSFILE-',
                },
                {
                    requiredPath: '/templates/uploadtemplate/interteam/validate_template_statusfile/',
                    fileNamePrefix: 'VALIDATE_TEMPLATE-STATUSFILE-',
                    uploadLogID: 2,
                    userId: 3
                    // memberIDIndex: 3 // memberID is found at the 3rd capture group
                },
                {
                    requiredPath: '/templates/samplefile/',
                    fileNamePrefix: 'CREATE_TEMPLATE-SAMPLE-'
                },
                {
                    requiredSubmissionPath: '/templates/consolidation/',
                    fileNamePrefix: '_Submission'
                },
                {
                    requiredConsolidationPath: '/templates/consolidation/',
                    fileNamePrefix: 'CONSOLIDATE-'
                },
                {
                    requiredInstructionfilePath: '/instructionfile/'
                }
            ];

            // Loop through all paths and try to match the corresponding regex
            for (const path of paths) {
                if (cUrl.includes(path.requiredMemberPath) && !cUrl.includes(path.fileNamePrefix)) {
                    // Construct regex to match the memberName and tempID in the URL
                    const regex = new RegExp(`${path.requiredMemberPath}([A-Z_]+)_([a-z0-9]+)\\.xlsx$`);
                    const match = cUrl.match(regex);

                    if (match) {
                        // Extract memberName and tempID
                        cMemberScac = match[1]; // Value before underscore, e.g., ALLINK
                        iTemplateID = match[2]; // ID after underscore, e.g., 66e0244eef381b69ccc02b69
                    }
                    // If IDs are extracted, proceed with the database queries
                    if (iTemplateID) {
                        try {
                            const iTemplateCounter = await this.FunDCT_GetTemplate(iTemplateID);

                            const oTemplateDetails = await Template.aggregate([
                                { $match: { _id: new mongoose.Types.ObjectId(iTemplateID) } },
                                { $project: { _id: 1, cTemplateName: 1 } }
                            ]);
                            if (oTemplateDetails.length > 0) {
                                cTemplateName = oTemplateDetails[0].cTemplateName;
                                if (cMemberScac) {
                                    if (iTemplateCounter !== null) {
                                        fullTemplateName = `${cMemberScac}_${iTemplateCounter}_${cTemplateName}`;
                                    } else {
                                        fullTemplateName = `${cMemberScac}_${iTemplateID}_${cTemplateName}`;
                                    }
                                    // fullTemplateName = `${cMemberScac}_${iTemplateID}_${cTemplateName}`;
                                }
                            }
                        } catch (err) {
                            console.error('Error during database query:', err);
                            return err;
                        }
                    }
                }
                else if (cUrl.includes(path.requiredPath) && cUrl.includes(path.fileNamePrefix)) {
                    regex = new RegExp(`${path.fileNamePrefix}([a-z0-9]+)(?:-([a-z0-9]+))?(?:-([a-z0-9]+))?`);

                    const match = cUrl.match(regex);
                    if (match && match[1]) {
                        iTemplateID = match[1];
                        memberUploadLogId = match[2];
                        if (path.memberIDIndex !== undefined && match[path.memberIDIndex]) {
                            memberID = match[path.memberIDIndex];
                        }
                        if (path.uploadLogID !== undefined && match[path.uploadLogID]) {
                            uploadLogID = match[path.uploadLogID];
                        }
                        if (path.userId !== undefined && match[path.userId]) {
                            userId = match[path.userId];
                        }
                        // break; // Stop checking after finding the correct match
                    }

                    // If IDs are extracted, proceed with the database queries
                    if (iTemplateID) {
                        const iTemplateCounter = await this.FunDCT_GetTemplate(iTemplateID);
                        try {
                            const oTemplateDetails = await Template.aggregate([
                                { $match: { _id: new mongoose.Types.ObjectId(iTemplateID) } },
                                { $project: { _id: 1, cTemplateName: 1 } }
                            ]);
                            if (memberUploadLogId) {
                                const oMemberUploadLogDetails = await MemTmplUploadLog.aggregate([
                                    { $match: { iActiveStatus: 0 } },
                                    { $match: { _id: new mongoose.Types.ObjectId(memberUploadLogId) } },
                                    { $project: { _id: 1, cScacCode: 1, cTemplateName: 1, iMemberID: 1 } }
                                ]);
                                if (oMemberUploadLogDetails.length > 0) {
                                    cMemberScac = oMemberUploadLogDetails[0].cScacCode;
                                }
                                else cMemberScac = '';
                            }
                            if (memberID && cMemberScac === '') {
                                const oMemberUserDetails = await User.aggregate([
                                    { $match: { _id: new mongoose.Types.ObjectId(memberID) } },
                                    { $project: { _id: 1, cCompanyname: 1, cName: 1, cUsername: 1 } }
                                ]);
                                if (oMemberUserDetails.length > 0) {
                                    cMemberScac = oMemberUserDetails[0].cCompanyname;
                                }
                            }
                            if (oTemplateDetails.length > 0) {
                                cTemplateName = oTemplateDetails[0].cTemplateName;
                                if (cMemberScac) {
                                    if (iTemplateCounter !== null) {
                                        fullTemplateName = `${cMemberScac}_${iTemplateCounter}_${cTemplateName}`;
                                    } else {
                                        fullTemplateName = `${cMemberScac}_${iTemplateID}_${cTemplateName}`;
                                    }
                                    // fullTemplateName = `${cMemberScac}_${iTemplateID}_${cTemplateName}`;
                                }
                                else if (uploadLogID && userId) {
                                    if (iTemplateCounter !== null) {
                                        fullTemplateName = `${cTemplateName}_${iTemplateCounter}_${uploadLogID}_${userId}_` + Date.now();
                                    } else {
                                        fullTemplateName = `${cTemplateName}_${iTemplateID}_${uploadLogID}_${userId}_` + Date.now();
                                    }
                                    // fullTemplateName = `${cTemplateName}_${iTemplateID}_${uploadLogID}_${userId}_` + Date.now();
                                }
                                else {
                                    if (iTemplateCounter !== null) {
                                        fullTemplateName = `${iTemplateCounter}_${cTemplateName}`;
                                    } else {
                                        fullTemplateName = `${iTemplateID}_${cTemplateName}`;
                                    }
                                    // fullTemplateName = `${iTemplateID}_${cTemplateName}`;
                                }
                            }
                        } catch (err) {
                            console.error('Error during database query:', err);
                            return err;
                        }
                    }
                }
                else if (cUrl.includes(path.requiredSubmissionPath) && cUrl.includes(path.fileNamePrefix)) {
                    // regex = new RegExp(`${path.fileNamePrefix}([a-z0-9]+)(?:-([a-z0-9]+))?(?:-([a-z0-9]+))?`);
                    // const match = cUrl.match(regex);
                    let match1;
                    regex = new RegExp(`${path.requiredSubmissionPath}([a-zA-Z0-9_]+)/\\1_Submission([a-z0-9]+)(?:-([a-z0-9]+))?(?:-([a-z0-9]+))?`);
                    match1 = cUrl.match(regex);
                    if (match1 != null) {
                        const scacName = match1[1]; // Dynamic SCAC name
                        const iTemplateID = match1[2];
                        const oTemplateDetails = await Template.aggregate([
                            { $match: { _id: new mongoose.Types.ObjectId(iTemplateID) } },
                            { $project: { _id: 1, cTemplateName: 1 } }
                        ]);
                        if (oTemplateDetails.length > 0) {
                            cTemplateName = oTemplateDetails[0].cTemplateName;
                            fullTemplateName = `${scacName}_${cTemplateName}_MEMBER_SUBMISSION`;
                        }
                    }
                    else {
                        console.log('No match found');
                    }
                }
                else if (cUrl.includes(path.requiredConsolidationPath) && cUrl.includes(path.fileNamePrefix)) {
                    let match2;
                    let regex2 = new RegExp(`${path.fileNamePrefix}([a-z0-9]+)_`);
                    match2 = cUrl.match(regex2);
                    if (match2 != null) {
                        const iTemplateID = match2[1]; // Dynamic 
                        const oTemplateDetails = await Template.aggregate([
                            { $match: { _id: new mongoose.Types.ObjectId(iTemplateID) } },
                            { $project: { _id: 1, cTemplateName: 1 } }
                        ]);
                        if (oTemplateDetails.length > 0) {
                            cTemplateName = oTemplateDetails[0].cTemplateName;
                            fullTemplateName = `${cTemplateName}_CONSOLIDATION_REPORT`;
                        }
                    } else {
                        console.log('No match found');
                    }
                }
                else if (cUrl.includes(path.requiredInstructionfilePath)) {
                    const regex = new RegExp(`${path.requiredInstructionfilePath}([^/]+)$`); // Match anything after /instructionfile/
                    const match = cUrl.match(regex);
                    if (match) {
                        fullTemplateName = match[1];
                    }
                }
                else {

                }
            }

            const s3ClientClass = new S3ClientClass();
            s3ClientClass.setStreamName(this.currentStreamName);
            let oDataStream: any = await s3ClientClass.get(cUrl);

            if (oDataStream) {
                let downloadPath;
                if (fullTemplateName != '') {
                    downloadPath = this.cDirTemplateSampleFile + fullTemplateName + '.xlsx';
                } else {
                    downloadPath = this.cDirTemplateSampleFile + 'CENTRIC_' + Date.now() + '.xlsx';
                }
                fs.writeFileSync(downloadPath, oDataStream);

                return {
                    oFileStream: downloadPath,
                    fullTemplateName: fullTemplateName || 'CENTRIC_' + Date.now()
                };
            }
        } catch (oErr) {
            this.error(oErr.message);
        }
    }

    public async FunDCT_GetTemplate(iTemplateID: string): Promise<number | null> {
        try {
            // Validate that the ID is a valid MongoDB ObjectId
            if (!mongoose.Types.ObjectId.isValid(iTemplateID)) {
                throw new Error("Invalid document ID.");
            }
            // Find the document by _id and return only the iTemplateCounter field
            const template = await Template.findById(iTemplateID, { iTemplateCounter: 1 });
            // If no document is found, return null
            if (!template) {
                console.log("Template not found");
                return null;
            }
            // Return the iTemplateCounter value
            return template.iTemplateCounter;
        } catch (error) {
            console.error("Error fetching template counter:", error);
            throw error; // You can throw the error or return null based on your requirement
        }
    }

    /**
     * To Upload S3 File
     * @param cFilePath string
     * @returns string
     */
    public async FunDCT_UploadS3File(cFilePath, zipBuffer?:Buffer, type?: string) {

        try {
            const s3ClientClass = new S3ClientClass();
            s3ClientClass.setStreamName(this.currentStreamName)
            if (type == undefined) {

                var params = {
                    Bucket: this.cAWSBucket,
                    Key: this.cAWSBucketEnv + '/' + this.cAWSBucketInstructionFile + '/' + path.basename(cFilePath),
                    Body: fs.readFileSync(cFilePath),
                    ContentType: oMimeType.lookup(cFilePath)
                };
                let cSignedURL = await s3ClientClass.put(params);
                return this.cAWSBucketEnv + '/' + this.cAWSBucketInstructionFile + '/' + path.basename(cFilePath);
            } else {
                let key;
                if (type === "interteam") {
                    key = this.cDirTemplateInterTeamUploadTemplateS3Path;
                }
                if (type === "prefilledno") {
                    key = "templates/uploadtemplate/interteam/validate_template_statusfile";
                }
                else {
                    key = this.cDirTemplateMemberUploadTemplateS3Path;
                }
                var zipParams  = {
                    Bucket: this.cAWSBucket,
                    Key: this.cAWSBucketEnv + '/' + key + '/' + path.basename(cFilePath),
                    Body: zipBuffer,
                    ContentType: oMimeType.lookup(cFilePath)
                };
                let cSignedURL = await s3ClientClass.put(zipParams );
                // const s3Clientdownload = new S3ClientClass();
                s3ClientClass.setStreamName(this.currentStreamName)
                // let cUrl = this.cAWSBucketEnv + '/' + key + '/' + path.basename(cFilePath);
                // let oDataStream: any = await s3Clientdownload.get(cUrl)
                // this.FuncDCT_CheckFolderPathExist(this.cDirTemplatesPath)
                // fs.writeFileSync(this.cDirTemplatesPath + 'test.zip', oDataStream);

                return this.cAWSBucketEnv + '/' + key + '/' + path.basename(cFilePath);
            }
        } catch (oErr) {
            this.error(oErr.message);
            // process.exit(1);
        }
    }

    /**
     * To Get Username from email
     * @param cEmail string
     */
    public async FunDCT_GetUserNameFromEmail(cEmail: string) {
        try {
            let oCurrentUserDetails: IUser = await User.findOne({ cEmail: cEmail });
            if (oCurrentUserDetails) {
                return (oCurrentUserDetails.cUsername);
            } else {
                return cEmail;
            }
            // return (oCurrentUserDetails.cUsername) ? oCurrentUserDetails.cUsername : cEmail;
        } catch (oErr) {
            this.error(oErr.message);
            // process.exit(1);
        }
    }

    public async FunDCT_GetTemplateDetails(iTemplateID: any) {
        try {
            const oTemplateDetails = await Template.aggregate([
                { $match: { _id: new mongoose.Types.ObjectId(iTemplateID) } },
                {
                    $lookup: {
                        from: "gen_statuses",
                        localField: "iStatusID",
                        foreignField: "_id",
                        as: "oTemplateListing"
                    },
                },
                { $unwind: "$oTemplateListing" },
                {
                    $lookup: {
                        from: "tmpl_metadatas",
                        localField: "_id",
                        foreignField: "iTemplateID",
                        as: "oTemplateMetaDataListing"
                    },
                },
                { $unwind: "$oTemplateMetaDataListing" }
            ]);//call back removed

            return oTemplateDetails;
        } catch (err) {
            return err;
        }
    }
    public async FuncDCT_CheckFolderPathExist(path: string) {
        try {
            await fs.accessSync(path);
        } catch (error) {
            if (error.code === 'ENOENT') {
                await fs.mkdirSync(path, { recursive: true })
            } else {
                console.error('Error:', error);
            }
        }
    }

    public FunDCT_ApiRequest(oReq) {

        const processCode = oReq.requestContext?.authorizer?.baseUrl ? oReq.requestContext.authorizer.baseUrl : 'Unknown'
        this.cCurrentAPIrequest = processCode
        let cToken
        try {
            if (oReq.header) {
                cToken = oReq.headers?.['x-wwadct-token'] || oReq.headers?.['X-WWADCT-TOKEN']
                if (cToken) {
                    this.FunDCT_SetCurrentUserDetails(cToken);
                }

            } else {

            }
        } catch (err) { console.log('Error while api request ', err) }

        this.FunDCT_set_CurrentStream()
    }
    private FunDCT_set_CurrentStream() {
        this.currentStreamName = this.cUserID + this.cCurrentAPIrequest
    }
    public log(args) {
        this.cUserID = this.cUserID ? this.cUserID : '0001'
        const logger = new cloudWatchClass()
        this.currentStreamName = this.cUserID + this.cCurrentAPIrequest
        logger.setStream(this.cUserID + this.cCurrentAPIrequest)
        return logger.log(args.toString())

    }
    public error(args) {
        this.cUserID = this.cUserID ? this.cUserID : '0001'
        const logger = new cloudWatchClass()
        this.currentStreamName = this.cUserID + this.cCurrentAPIrequest
        logger.setStream(this.cUserID + this.cCurrentAPIrequest)
        return logger.log(args.toString())
    }
    public info(args) {
        this.cUserID = this.cUserID ? this.cUserID : '0001'
        const logger = new cloudWatchClass()
        this.currentStreamName = this.cUserID + this.cCurrentAPIrequest
        logger.setStream(this.cUserID + this.cCurrentAPIrequest)
        return logger.log(args.toString())
    }

}
export default new ClsDCT_Common();