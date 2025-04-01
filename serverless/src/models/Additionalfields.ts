/**
 * Additional Fields Model
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

/**
* Interface to model GenStatus for TypeScript.
* @param cAdditionalFieldText: string 
* @param cAdditionalFieldValue: string 
* @param cSelectionType: string
* @param iEnteredby: string
* @param tEntered: Date
* @param iUpdatedby: string
* @param tUpdated: Date;
*/
export interface IAdditionalFields extends Document {
  cAdditionalFieldText: string;
  cAdditionalFieldValue: string;
  cSelectionType: string;
  iStatusID: IStatus['_id'];
  iEnteredby: IUser['_id'];
  tEntered: Date;
  iUpdatedby: IUser['_id'];
  tUpdated: Date;
}

const AdditionalFieldsSchema: Schema = new Schema({
  cAdditionalFieldText: {
    type: String,
    required: true
  },
  cAdditionalFieldValue: {
    type: String,
    required: true
  },
  cSelectionType: {
    type: String,
    enum: ['Single','Multiple'],
    default: 'Single'
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

const AdditionalFields: Model<IAdditionalFields> = model<IAdditionalFields>("gen_additionalfields", AdditionalFieldsSchema);

export default AdditionalFields;
