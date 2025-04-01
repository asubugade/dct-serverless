import { Document, Model, model, Schema } from "mongoose";
import { format } from "path";
import { IUser } from "./GenUser";
import { IStatus } from "./GenStatus";
import GenProcess, { IProcess } from "../models/GenProcess";
/**
* Interface to model GenMessage for TypeScript.
* @param iProcessID: number 
* @param cSubject: string 
* @param cEmailBody: string 
* @param cFrom: string 
* @param cBcc: string 
* @param iStatusID: string
* @param iEnteredby: string
* @param tEntered: Date
* @param iUpdatedby: string
* @param tUpdated: Date;
*/
export interface IEmailtemplates extends Document {
  iProcessID: IProcess["_id"];
  cSubject: string;
  cEmailBody: string;
  cFrom: string;
  cBcc: string;
  iStatusID: IStatus['_id'];
  iEnteredby: IUser['_id'];
  tEntered: Date;
  iUpdatedby: IUser['_id'];
  tUpdated: Date;
}

const GenEmailtemplates: Schema = new Schema({
  iProcessID: {
    type: Schema.Types.ObjectId,
    ref: "gen_processes",
    required: true
  },
  cEmailType: {
    type: String,
    required: true,
    unique: true
  },
  cSubject: {
    type: String,
    required: true
  },
  //added by jraisoni
  cFromEmailText: {
    type: String,
    required: true
  },
  cEmailBody: {
    type: String,
    required: true
  },
  cFrom: {
    type: String,
    required: true,
  },
  cBcc: {
    type: String,
    required: true,
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
  }
});

const Emailtemplates: Model<IEmailtemplates> = model<IEmailtemplates>("gen_emailtemplates", GenEmailtemplates);

export default Emailtemplates;
