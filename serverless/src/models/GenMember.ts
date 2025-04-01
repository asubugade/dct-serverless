import { Document, Model, model, Schema } from "mongoose";
import GenStatus, { IStatus } from "../models/GenStatus";
import User, { IUser } from "../models/GenUser";

/**
* Interface to model GenAccessType for TypeScript.
* @param cScac: string 
* @param cName: string 
* @param cAddress: string
* @param cCity: string
* @param cState: string
* @param cPostalcode: string
* @param cContinent: string
* @param cTemplateType: json
* @param cTel: string
* @param cFax: string
* @param cEmail: string
* @param cContactperson: string
* @param cLocationcode: string
* @param cWebpage: string
* @param cType: string
* @param cAlliance: string
* @param cCarrierStatus: string
* @param iStatusID: string
* @param iEnteredby: string
* @param tEntered: Date
* @param iUpdatedby: string
* @param tUpdated: Date;
*/
export interface IMember extends Document {
  cScac: string;
  cName: string;
  cAddress: string;
  cCity: string;
  cState: string;
  cPostalcode: string;
  cContinent: string;
  cTel: string;
  cFax: string;
  cEmail: string;
  cContactperson: string;
  cLocationcode: string;
  cWebpage: string;
  cType: string;
  cAlliance: string;
  cCarrierStatus: string;
  iStatusID: IStatus['_id'];
  iEnteredby: IUser['_id'];
  tEntered: Date;
  iUpdatedby: IUser['_id'];
  tUpdated: Date;
  cTemplateType: JSON;
}

const GenMemberSchema: Schema = new Schema({
  cScac: {
    type: String,
    required: true,
    unique: true
  },
  cName: {
    type: String,
    required: true,
    unique: true
  },
  cAddress: {
    type: String,
    required: true
  },
  cCity: {
    type: String,
    required: true
  },
  cState: {
    type: String,
    required: true
  },
  cPostalcode: {
    type: String,
    required: true
  },
  cContinent: {
    type: String,
    required: true
  },
  cTel: {
    type: String,
    required: true
  },
  cFax: {
    type: String,
    required: true
  },
  cEmail: {
    type: String,
    required: true
  },
  cContactperson: {
    type: String,
    required: true
  },
  cLocationcode: {
    type: String,
    required: true
  },
  cWebpage: {
    type: String,
    required: true
  },
  cType: {
    type: String,
    enum: ['Member','Carrier'],
    default: 'Member'
  },
  cAlliance: {
    type: String,
    enum: ['Default','No Alliance','THE Alliance','OCEAN ALLIANCE','2M','CHHK','CKHYE','MTT','SHPT'],
    default: 'Default'
  },
  cCarrierStatus: {
    type: String,
    enum: ['Yes','No'],
    default: 'No'
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
  cTemplateType: {
    type: [Schema.Types.ObjectId]
  },
});

const GenMember: Model<IMember> = model<IMember>("gen_members", GenMemberSchema);

export default GenMember;
