import { Document, Model, model, Schema } from "mongoose";
import GenStatus, { IStatus } from "../models/GenStatus";
import User, { IUser } from "../models/GenUser";


 /**
  * Interface to model GenProcess for TypeScript.
  * @param iStatusID: string
  * @param cCityName: string
  * @param iEnteredby: string
  * @param tEntered: Date
  * @param iUpdatedby: string
  * @param cCode : string
  * @param cCountryCode :string
  * @param tUpdated: Number;
  */
export interface ILocation extends Document {
    cCode : string;
    cCityName: string;
    cCountryCode :string;
    iStatusID: IStatus["_id"];
    iEnteredby: IUser["_id"];
    tEntered: Date;
    iUpdatedby: IUser["_id"];
    tUpdated: Date;
}

const GenLocation: Schema = new Schema({
 cCode: {
    type: String,
    required: true,
    unique: true
  },
  cCityName: {
    type: String,
    required: true,
    unique: true
  },
 cCountryCode: {
    type: String,
    required: true
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
  }
});

const Location: Model<ILocation> = model<ILocation>("gen_locations",GenLocation);

export default Location;
