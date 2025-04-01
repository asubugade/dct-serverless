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
* @param aTemplateFileName: string,
* @param aTemplateFileSize: string,
* @param startHeaderRowIndex: number,
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
export interface ITmplUploadLog extends Document {
  iTemplateID: string;
  //cTemplateName added by spirgonde for member upload log Search filter task
  cTemplateName: string ;
  iMemberID: string;
  cScacCode: string;
  cTemplateFile: string;
  cTemplateStatusFile: string;
  aTemplateFileName: string,
  aTemplateFileSize: string,
  startHeaderRowIndex: Number,
  iExceptionFound: String;
  cUploadedFile: JSON;
  cTemplateStatusUploadedFile: JSON;
  iMaxDepthHeaders: Number;
  cExceptionDetails: JSON;
  cDistributionDetails: JSON;
  cSelectedMembers: JSON;
  bExceptionfound: string;
  bProcesslock: string;
  bProcessed: string;
  tProcessStart: Date;
  tProcessEnd: Date;
  iStatusID: IStatus['_id'];
  iEnteredby: IUser['_id'];
  tEntered: Date;
  iUpdatedby: IUser['_id'];
  tUpdated: Date;
  cAddtionalFile:string; //code added by spirgonde for additional file upload task
  iActiveStatus:Number;
}

const TmplUploadLogSchema: Schema = new Schema({
  iTemplateID: {
    type: Schema.Types.ObjectId,
    ref: "Template"
  },
  //cTemplateName added by spirgonde for template upload log Search filter task
  cTemplateName: {
    type: Schema.Types.String,
    ref: "gen_templates"
  },
  iMemberID: {
    type: Schema.Types.ObjectId,
    ref: "GenMember"
  },
  cScacCode: {
    type: Schema.Types.ObjectId,
    ref: "GenMember"
  },
  cTemplateFile: {
    type: String,
  },
  cTemplateStatusFile: {
    type: String,
  },
  aTemplateFileName: {
    type: String,
  },
  aTemplateFileSize: {
    type: String,
  },
  startHeaderRowIndex:{
    type: Number,
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
  cDistributionDetails: {
    type: JSON,
  },
  cSelectedMembers: {
    type: JSON,
  },
  iMaxDepthHeaders: {
    type: Number,
    required: true,
    default: 0
  },
  bExceptionfound: {
    type: String,
    enum: ['Y','N'],
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
  tProcessStart: {
    type: Date
  },
  tProcessEnd: {
    type: Date
  },
  iStatusID: {
    type: Schema.Types.ObjectId,
    ref: "Status"
  },
  iEnteredby: {
    type: Schema.Types.ObjectId,
    ref: "User"
  },
  tEntered: {
    type: Date
  },
  iUpdatedby: {
    type: Schema.Types.ObjectId,
    ref: "User"
  },
  tUpdated: {
    type: Date
  },
  //code added by spirgonde for additional file upload task start... 
  cAddtionalFile:{
    type: String,
  },
  //code added by spirgonde for additional file upload task end.
  iActiveStatus:{
    type: Number,
  },
});

const TmplUploadLog: Model<ITmplUploadLog> = model<ITmplUploadLog>("tmpl_uploadlogs", TmplUploadLogSchema);

export default TmplUploadLog;
