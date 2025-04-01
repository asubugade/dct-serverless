import { Document, Model, model, Schema } from "mongoose";
import GenAccessType, { IAccessType } from "../models/GenAccessType";
import GenProcess, { IProcess } from "../models/GenProcess";
import GenStatus, { IStatus } from "../models/GenStatus";
import User, { IUser } from "../models/GenUser";


/**
 * Interface to model GenProcess for TypeScript.
 * @param cBasis: String
 * @param cCode: String 
 * @param cName: String
 * @param cComment: string 
 * @param iBasisGroupID: Number
 * @param cGlobalConversion: Number
 * @param cCSRFQConversion: Number
 * @param bInland: string
 * @param iStatusID: string
 * @param iEnteredby: string
 * @param tEntered: Date
 * @param iUpdatedby: string
 * @param tUpdated: Date;
 */

export interface IRatebasis extends Document {
    cBasis: String
    cCode: string;
    cName: string;
    cComment: string;
    iBasisGroupID: Number;
    cGlobalConversion: Number;
    cCSRFQConversion: Number;
    bInland: string;
    iStatusID: IStatus["_id"];
    iEnteredby: IUser["_id"];
    tEntered: Date;
    iUpdatedby: IUser["_id"];
    tUpdated: Date;
}

const GenRatebasis: Schema = new Schema({
    cBasis: {
        type: String,
        required: true
    },
    cCode: {
        type: String,
        required: true
    },
    cName: {
        type: String,
        required: true,
        unique: true
    },
    cComment: {
        type: String,
    },
    iBasisGroupID: {
        type: Number,
        required: true,
    },
    cGlobalConversion: {
        type: Number,
        required: true,
    },
    cCSRFQConversion: {
        type: Number,
        required: true,
    },
    bInland: {
        type: String,
        enum: ['Y', 'N'],
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

const Ratebasis: Model<IRatebasis> = model<IRatebasis>("gen_basises", GenRatebasis);

export default Ratebasis;
