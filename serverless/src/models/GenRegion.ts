import { Document, Model, model, Schema } from "mongoose";
import { format } from "path";
import { IUser } from "./GenUser";
import { IStatus } from "./GenStatus";

/**
* Interface to model GenMessage for TypeScript.
* @param cCode: string 
* @param cName: string 
* @param cTemplateType:[string]    //code  added by spirgonde for select template checkbox dropdown  
* @param iStatusID: string
* @param iEnteredby: string
* @param tEntered: Date
* @param iUpdatedby: string
* @param tUpdated: Date;
*/
export interface IRegion extends Document {
  cCode: string;
  cName: string;
  cTemplateType: JSON;
  iStatusID: IStatus['_id'];
  iEnteredby: IUser['_id'];
  tEntered: Date;
  iUpdatedby: IUser['_id'];
  tUpdated: Date;
}

const GenRegion: Schema = new Schema({
  cCode: {
    type: String,
    required: true
  },
  cName: {
    type: String,
    required: true,
    unique: true
  },
  // cTemplateType: {
  //   type: [String],
  //   enum: ['Default','RFQTool','Carrier VID','Direct & Pipeline Service Guide','Offices and Warehouse List','WWA CARRIER VID REVIEW','WWA Export-Import Agent List','WWA Member Data Export','WWA Member Data Import'],
  //   default: 'Default'
  // },
  cTemplateType: {
    type: [Schema.Types.ObjectId]
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

const Region: Model<IRegion> = model<IRegion>("gen_regions", GenRegion);

export default Region;
