/**
 * Template Upload Log Model
 * 
 * Below this goes the tags to further describe element you are documenting
 * @author 	mpatil <mpatil@shipco.com>
 * @copyright	WWA DCT
 * @version	1.1
 * @since  	2021-01-01
 * 
 */

import { Document, Model, model, Schema } from "mongoose";
import { IUser } from "./GenUser";
import { IStatus } from "./GenStatus";
import { ITemplate } from "./GenTemplate";
import { IMember } from "./GenMember";
import { json } from "express";

/**
* Interface to model GenStatus for TypeScript.
* @param iTemplateID: string 
* @param iMemberID: string 
* @param cScacCode: string
* @param cAddtionalComment: string
* @param aTemplateFileName: string,
* @param aTemplateFileSize: string,
* @param iExceptionfound: json
* @param cExceptiondetails: json
* @param cDistributionDetails: json
* @param cSelectedMembers: json
* @param iReadyForInsert: string
* @param iReadyForPartInsert: string
* @param iInserted: string
* @param iProcesslock: string
* @param iLocked: string
* @param iStatusID: string
* @param iEnteredby: string
* @param tEntered: Date
* @param iUpdatedby: string
* @param tUpdated: Date;
*/
export interface IMemTmplUploadLog extends Document {
  iTemplateID: string;
  //cTemplateName added by spirgonde for member upload log Search filter task
  cTemplateName: string ;
  iMemberID: string;
  cScacCode: string;
  cTemplateFile: string;
  cTemplateStatusFile: string;
  cAddtionalComment: string,
  aTemplateFileName: string,
  aTemplateFileSize: string,
  cAddtionalFile: string,//changed type: JSON to type: String code added by spirgonde for additional file upload task start... 
  cUploadedFile: JSON;
  cTemplateStatusUploadedFile: JSON;
  cExceptionDetails: JSON;
  cUploadType:string,
  isRateExtendMode:string,
  bExceptionfound:string,
  bProcesslock:string,
  bProcessed:string,
  // cUploadStatus:string,
  tProcessStart: Date;
  tProcessEnd: Date;
  iStatusID: IStatus['_id'];
  iEnteredby: IUser['_id'];
  tEntered: Date;
  iUpdatedby: IUser['_id'];
  tUpdated: Date;
  iActiveStatus:Number;
}

const MemUploadLogSchema: Schema = new Schema({
  iTemplateID: {
    type: Schema.Types.ObjectId,
    ref: "gen_templates"
  },
  //cTemplateName added by spirgonde for member upload log Search filter task
  cTemplateName: {
    type: Schema.Types.String,
    ref: "gen_templates"
  },
  iMemberID: {
    type: Schema.Types.ObjectId,
    ref: "gen_members"
  },
  cScacCode: {
    type: Schema.Types.String,
    ref: "gen_members"
  },
  cTemplateFile: {
    type: String,
  },
  cTemplateStatusFile: {
    type: String,
  },
  cAddtionalComment: {
    type: String,
  },
  aTemplateFileName: {
    type: String,
  },
  aTemplateFileSize: {
    type: String,
  },
  cAddtionalFile: {
    type: String,//changed type: JSON to type: String code added by spirgonde for additional file upload task start... 
  },
  cUploadedFile: {
    type: JSON,
  },
  cTemplateStatusUploadedFile: {
    type: JSON,
  },
  cExceptionDetails: {
    type: JSON,
  },
  cUploadType: {
    type: String,
    enum: ['None','NMEMBER_UPLOAD','MEMBER_ADMIN_UPLOAD'],
    default: 'None'
  },
  isRateExtendMode:{
    type: String,
    default: 'false'
  },
  bExceptionfound: {
    type: String,
    enum: ['Y','N','P'],
    default: 'Y'
  },
  bProcesslock: {
    type: String,
    enum: ['Y','N'],
    default: 'N'
  },
  bProcessed: {
    type: String,
    enum: ['Y','N','F'],
    default: 'N'
  },
  // cUploadStatus: {
  //   type: String,
  //   enum: ['Waiting','Full Upload', 'No Upload', 'Partial Upload'],
  //   default: 'Waiting'
  // },
  tProcessStart: {
    type: Date
  },
  tProcessEnd: {
    type: Date
  },
  iStatusID: {
    type: Schema.Types.ObjectId,
    ref: "gen_statuses"
  },
  iEnteredby: {
    type: Schema.Types.ObjectId,
    ref: "gen_users"
  },
  tEntered: {
    type: Date
  },
  iUpdatedby: {
    type: Schema.Types.ObjectId,
    ref: "gen_users"
  },
  tUpdated: {
    type: Date
  },
  iActiveStatus:{
    type: Number,
  },
});

const MemTmplUploadLog: Model<IMemTmplUploadLog> = model<IMemTmplUploadLog>("mem_uploadlogs", MemUploadLogSchema);

export default MemTmplUploadLog;
