/**
 * Gen Message Model
 * 
 * Below this goes the tags to further describe element you are documenting
 * @author 	mpatil <mpatil@shipco.com>
 * @copyright	WWA DCT
 * @version	1.1
 * @since  	2021-01-01
 * 
 */


import { Document, Model, model, Schema } from "mongoose";
import { format } from "path";
import { IUser } from "./GenUser";
import { IStatus } from "./GenStatus";

/**
* Interface to model GenMessage for TypeScript.
* @param cModuleCode: string 
* @param cMessageCode: string 
* @param cDescription: string
* @param iStatusID: string
* @param iEnteredby: string
* @param tEntered: Date
* @param iUpdatedby: string
* @param tUpdated: Date;
*/
export interface IMessage extends Document {
  cModuleCode: string;
  cMessageCode: string;
  cDescription: string;
  iStatusID: IStatus['_id'];
  iEnteredby: IUser['_id'];
  tEntered: Date;
  iUpdatedby: IUser['_id'];
  tUpdated: Date;
}

const GenMessage: Schema = new Schema({
  cModuleCode: {
    type: String,
    required: true
  },
  cMessageCode: {
    type: String,
    required: true,
  },
  cDescription: {
    type: String,
    required: true
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

const Message: Model<IMessage> = model<IMessage>("gen_messages", GenMessage);

export default Message;
