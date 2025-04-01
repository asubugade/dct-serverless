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

/**
* Interface to model GenStatus for TypeScript.
* @param iTemplateTypeID: string 
* @param jDump: json 
* @param iStatus: Number
* @param cProcessingType: string
* @param iEnteredby: string
* @param tEntered: Date
* @param iUpdatedby: string
* @param tUpdated: Date;
*/
export interface IGenLaneSchedule extends Document {
  iTemplateTypeID: string;
  jDump:JSON;
  iStatus: Number;
  iEnteredby: IUser['_id'];
  tEntered: Date;
  iUpdatedby: IUser['_id'];
  tUpdated: Date;
  cProcessingType: string;
}

const GenLaneScheduleSchema: Schema = new Schema({
  iTemplateTypeID: {
    type: Schema.Types.ObjectId,
    ref: "gen_template_types"
  },
  jDump: {
    type: JSON,
  },
  iStatus: {
    type: Number,
    required: true,
    default: 0
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
  cProcessingType: {
    type: String
  }
});

const GenLaneSchedule: Model<IGenLaneSchedule> = model<IGenLaneSchedule>("gen_laneSchedule", GenLaneScheduleSchema);

export default GenLaneSchedule;
