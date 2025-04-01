import { Document, Model, model, Schema } from "mongoose";

import { IStatus } from "./GenStatus";
import { IUser } from "./GenUser";
import GenProcess, { IProcess } from "./GenProcess";
/**
* Interface to model GenMessage for TypeScript.
* @param iProcessID: number 
* @param iHour: number 
* @param iMinute: number 
* @param cSubject: string 
* @param cFrom: string 
* @param cBcc: string 
* @param iStatusID: string
* @param iEnteredby: string
* @param tEntered: Date
* @param iUpdatedby: string
* @param tUpdated: Date;
* @param cProcessCode: string;
*/
export interface IReminderEmailFrequency extends Document {
  iProcessID: IProcess["_id"];
  iHour : number;
  iMinute : number;
  cEmailBody: string;
  cFrom: string;
  cBcc: string;
  iStatusID: IStatus['_id'];
  iEnteredby: IUser['_id'];
  tEntered: Date;
  iUpdatedby: IUser['_id'];
  tUpdated: Date;
}

const ReminderEmailFrequency: Schema = new Schema({
  iProcessID: {
    type: Schema.Types.ObjectId,
    ref: "gen_processes",
    required: true
  },
  iHour:{
    type: Number,
    required: true,
  },
  iMinute:{
    type: Number,
    required: true,
  },
  cFrom: {
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

const EmailFrequency: Model<IReminderEmailFrequency> = model<IReminderEmailFrequency>("tmpl_reminderemailfreqs", ReminderEmailFrequency);

export default EmailFrequency;
