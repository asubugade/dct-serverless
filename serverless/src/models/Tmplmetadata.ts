/**
 * Template Meta Data Model
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
import { json } from "express";

/**
* Interface to model GenStatus for TypeScript.
* @param cAdditionalFieldText: string 
* @param cAdditionalFieldValue: string 
* @param cSelectionType: string
* @param iEnteredby: string
* @param tEntered: Date
* @param iUpdatedby: string
* @param tUpdated: Date;
* @param cConsolidation: string; //code added by spirgonde for Autogenerate Consolidation report on template expired
* @param cGenerated: string; //code added by spirgonde for Autogenerate Consolidation report on template expired
*/

export interface ITmplMetaData extends Document {
  iTemplateID: string;
  cHeaderType: string;
  aTemplateHeader: JSON;
  aUnMappedColumns: JSON;
  aMappedColumns: JSON;
  aUnMappedColumnLabels: JSON;
  aMappedScacColumnsStat: JSON;
  aConsolidationData: JSON;
  aDistributedData: JSON;
  aMemberCutoffs: JSON;
  aAdditionalConfiguration: JSON;
  iMaxDepthHeaders: Number;
  startHeaderRowIndex: Number
  cQuotingMembers: JSON;
  tCuttoffdate: string;
  cDistributionStatus: string;
  iRedistributedIsUploaded: string;
  // tCuttoffdate: Date;
  // cIsAdditionalFile: string;
  cAddtionalFile: string;
  aTemplateFileInfo: JSON;
  aAdditionalFileInfo: JSON;
  cAdditionalEmail: JSON;
  cEmailFrom: string;
  cEmailTemplateID: string;//added by jraisoni
  cEmailText: JSON;
  cEmailSubject: string;
  iStatusID: IStatus['_id'];
  iEnteredby: IUser['_id'];
  tEntered: Date;
  iUpdatedby: IUser['_id'];
  tUpdated: Date;
  cConsolidation: string; //code added by spirgonde for Autogenerate Consolidation report on template expired
  cGenerated : string; //code added by spirgonde for Autogenerate Consolidation report on template expired
}

const TmplMetaDataSchema: Schema = new Schema({
  iTemplateID: {
    type: Schema.Types.ObjectId,
    ref: "Template"
  },
  cHeaderType: {
    type: String,
    enum: ['Single','Multiple','Import'],
    default: 'Single'
  },
  aTemplateHeader: {
    type: JSON,
    required: true
  },
  aUnMappedColumns: {
    type: JSON,
  },
  aMappedColumns: {
    type: JSON,
  },
  aUnMappedColumnLabels: {
    type: JSON,
  },
  aMappedScacColumnsStat: {
    type: JSON,
  },
  aConsolidationData: {
    type: JSON,
  },
  aDistributedData: {
    type: JSON,
  },
  aMemberCutoffs: {
    type: JSON,
  },
  aAdditionalConfiguration: {
    type: JSON,
    required: true
  },
  iMaxDepthHeaders: {
    type: Number,
    required: true,
    default: 0
  },
  startHeaderRowIndex: {
    type: Number,
  },
  cQuotingMembers: {
    type: JSON,
  },
  tCuttoffdate: {
    type: String
  },
  cDistributionStatus: {
    type: String,
    enum: ['Common','Redistribute-StructureChange','Redistribute-DataChange'],
    default: 'Common'
  },
  iRedistributedIsUploaded: {
    type: String,
    enum: ['0','1'],
    default: '0'
  },
  cAddtionalFile: {
    type: String,
  },
  aTemplateFileInfo: {
    type: JSON,
  },
  aAdditionalFileInfo: {
    type: JSON,
  },
  cAdditionalEmail: {
    type: JSON,
  },
  cEmailFrom: {
    type: String,
  },
  //added by jraisoni
  cEmailTemplateID:{
    type: String,
  },
  cEmailText: {
    type: JSON,
  },
  cEmailSubject : {
    type: String,
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
  //code added by spirgonde for Autogenerate Consolidation report on template expired start ...
  cConsolidation: {
    type: String,
    enum: ['Yes','No'],
    default: 'No'
  },
  cGenerated: {
    type: String,
    enum: ['Yes','No'],
    default: 'No'
  }
  //code added by spirgonde for Autogenerate Consolidation report on template expired end .
});

const TmplMetaData: Model<ITmplMetaData> = model<ITmplMetaData>("tmpl_metadatas", TmplMetaDataSchema);

export default TmplMetaData;
