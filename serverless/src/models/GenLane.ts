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
* @param cProcessingType: string
* @param iToDo: Number
* @param iActive: Number
* @param iStatus: Number
* @param iEnteredby: string
* @param tEntered: Date
* @param iUpdatedby: string
* @param tUpdated: Date;
*/
export interface IGenLane extends Document {
  iTemplateTypeID: string;
  cProcessingType: string;
  iToDo: Number;
  iActive: Number;
  iStatus: Number;
  iEnteredby: IUser['_id'];
  tEntered: Date;
  iUpdatedby: IUser['_id'];
  tUpdated: Date;
}

const GenLaneSchema: Schema = new Schema({
  iTemplateTypeID: {
    type: Schema.Types.ObjectId,
    ref: "gen_template_types"
  },
  cProcessingType: {
    type: String,
  },
  iToDo: {
    type: Number,
    default: 1
  },
  iActive: {
    type: Number,
    required: true,
    default: 0
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
});

const GenLane: Model<IGenLane> = model<IGenLane>("gen_lane", GenLaneSchema);

export default GenLane;
