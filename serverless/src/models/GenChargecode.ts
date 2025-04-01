import { Document, Model, model, Schema } from "mongoose";
import GenAccessType, { IAccessType } from "../models/GenAccessType";
import GenProcess, { IProcess } from "../models/GenProcess";
import GenStatus, { IStatus } from "../models/GenStatus";
import User, { IUser } from "../models/GenUser";


/**
 * Interface to model GenProcess for TypeScript.
 * @param cCode: string 
 * @param cName: string 
 * @param cChargegroup: string
 * @param cDefault: string
 * @param iStatusID: string
 * @param iEnteredby: string
 * @param tEntered: Date
 * @param iUpdatedby: string
 * @param tUpdated: Date;
 */

export interface IChargecode extends Document {
    cCode: string;
    cName: string;
    cChargegroup: string;
    cDefault: string;
    iStatusID: IStatus["_id"];
    iEnteredby: IUser["_id"];
    tEntered: Date;
    iUpdatedby: IUser["_id"];
    tUpdated: Date;
}

const GenChargecode: Schema = new Schema({
    cCode: {
        type: String,
        required: true
    },
    cName: {
        type: String,
        required: true,
        unique: true
    },
    cChargegroup: {
        type: String,
        enum: ['OFR','FOB','PLC','On Carriage','Pre Carriage'],
        default: 'OFR'
    },
    cDefault: {
        type: String,
        enum: ['Y','N'],
        default: 'N'
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

const Chargecode: Model<IChargecode> = model<IChargecode>("gen_chargecodes", GenChargecode);

export default Chargecode;
