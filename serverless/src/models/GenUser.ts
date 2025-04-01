import { Document, Model, model, Schema } from "mongoose";
import { IStatus } from "./GenStatus";
//import { IAccessType } from "./GenAccessType";
import GenAccessType, { IAccessType } from "../models/GenAccessType"
import GenMember, { IMember } from "../models/GenMember"

/**
* Interface to model the User Schema for TypeScript.
* @param iAccessTypeID: string 
* @param cTemplateType: json
* @param cEmail: string 
* @param cPassword: string 
* @param cAvatar: string 
* @param cName: string 
* @param cUsername: string 
* @param cCompanyname: string 
* @param cAddress: string 
* @param cCity: string 
* @param cPostalcode: string 
* @param cState: string 
* @param cPhone: string 
* @param cFax: string 
* @param cPwdToken: string
* @param iStatusID: string
* @param iEnteredby: string
* @param tEntered: Date
* @param iUpdatedby: string
* @param tUpdated: Date;
* @param  passwordHistory: string[];
* 
 */
export interface IUser extends Document {
  passwordHistory: string[];
  iAccessTypeID: IAccessType["_id"];
  cTemplateType: JSON;
  cEmail: string;
  cPassword: string;
  cAvatar: string;
  cName: string;
  cUsername: string;
  cCompanyname: string;
  cAddress: string;
  cCity: string;
  cPostalcode: string;
  cState: string;
  cPhone: string;
  cFax: string;
  cPwdToken: string;
  iStatusID: IStatus['_id'];
  iEnteredby: string;
  tEntered: Date;
  iUpdatedby: string;
  tUpdated: Date;
}

const userSchema: Schema = new Schema({
  iAccessTypeID: {
    type: Schema.Types.ObjectId,
    ref: "gen_accesstypes"
  },
  cTemplateType: {
    type: [Schema.Types.ObjectId]
  },
  cEmail: {
    type: String,
    required: true,
    unique: true
  },
  cPassword: {
    type: String,
    required: true
  },
  cAvatar: {
    type: String
  },
  cName: {
    type: String,
    required: true
  },
  cUsername: {
    type: String,
    required: true,
    unique: true
  },
  cCompanyname: {
    type: Schema.Types.String,
    ref: "gen_members"
  },
  cAddress: {
    type: String,
    required: true
  },
  cCity: {
    type: String,
    required: true
  },
  cPostalcode: {
    type: String,
    required: true
  },
  cState: {
    type: String,
    required: true
  },
  cPhone: {
    type: String,
    required: true
  },
  cFax: {
    type: String,
    // required: true
  },
  cPwdToken: {
    type: String
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
  passwordHistory: {
    type: [String], 
    default: []  
  }
});


const User: Model<IUser> = model<IUser>("gen_users", userSchema);

export default User;
