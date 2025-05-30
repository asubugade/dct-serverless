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
 * @param cTemplateStatusFile: string 
 * @param cTemplateStatusUploadedFile: json
 * @param bProcesslock: string
 * @param bProcessed: string
 * @param tProcessStart: Date
 * @param tProcessEnd: Date
 * @param iStatusID: string
 * @param iEnteredby: string
 * @param tEntered: Date
 * @param iUpdatedby: string
 * @param tUpdated: Date;
 * @param cRequestType: string;
 * @param IsConsolidationRequested: string;
 */
 export interface ITmplConsolidationReq extends Document {
   iTemplateID: string;
   cTemplateStatusFile: string;
   cTemplateStatusUploadedFile: JSON;
   bProcesslock: string;
   bProcessed: string;
   tProcessStart: Date;
   tProcessEnd: Date;
   iStatusID: IStatus['_id'];
   iEnteredby: IUser['_id'];
   tEntered: Date;
   iUpdatedby: IUser['_id'];
   tUpdated: Date;
   cRequestType: string;
   IsConsolidationRequested: JSON;
 }
 
 const TmplConsolidationReqSchema: Schema = new Schema({
   iTemplateID: {
     type: Schema.Types.ObjectId,
     ref: "Template"
   },
   cTemplateName: {
    type: Schema.Types.String,
    ref: "gen_templates"
  },
   cTemplateStatusFile: {
     type: String,
   },
   cTemplateStatusUploadedFile: {
     type: JSON,
   },
   cExceptiondetails: {
     type: JSON,
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
   cRequestType: {
     type: String
   },
   IsConsolidationRequested:{
    type: JSON,
   }
 });
 
 const TmplConsolidationReq: Model<ITmplConsolidationReq> = model<ITmplConsolidationReq>("tmpl_consolidationreqs", TmplConsolidationReqSchema);
 
 export default TmplConsolidationReq;
 