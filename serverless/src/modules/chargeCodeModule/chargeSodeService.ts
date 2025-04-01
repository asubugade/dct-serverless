import { ClsDCT_Common } from "../../commonModule/Class.common";
import HttpStatusCodes from "http-status-codes";
import { getChargeCode, getChargeCodeCount } from "./chargeCodeDal";
import GenChargecode, { IChargecode } from "../../models/GenChargecode";

export class ChargeCodeService {
    private _oCommonCls = new ClsDCT_Common();

    public chargeCodeListing = async (event) => {
        try {
            const body = JSON.parse(event.body);
            const { iOffset, iLimit, iOffsetLimit, cSearchFilter, cSort, cSortOrder } = body;
            const aRequestDetails = { iOffset, iLimit, iOffsetLimit, cSearchFilter, cSort, cSortOrder };

            let cSearchFilterQuery: any;
            if (aRequestDetails.cSearchFilter) {
                cSearchFilterQuery = { $match: { $or: [{ "cCode": { "$regex": aRequestDetails.cSearchFilter, "$options": "i" } }, { "cName": { "$regex": aRequestDetails.cSearchFilter, "$options": "i" } }] } };
            } else {
                cSearchFilterQuery = { $match: {} };
            }

            let oSort = {};
            if (aRequestDetails.cSort) {
                oSort[aRequestDetails.cSort] = aRequestDetails.cSortOrder;
            } else {
                oSort['_id'] = -1;
            }

            let iCount: number = await getChargeCodeCount(cSearchFilterQuery);
            if (iCount > 0) {
                let oChargecode: any = await getChargeCode(aRequestDetails, oSort, cSearchFilterQuery, iCount);
                if (oChargecode) {
                    let oChargecodeRes = {
                        total: iCount,
                        page: aRequestDetails.iOffset,
                        pageSize: aRequestDetails.iLimit,
                        aModuleDetails: oChargecode
                    };
                    return await this._oCommonCls.FunDCT_Handleresponse('Success', 'CHARGECODE', 'CHARGECODE_LISTED', 200, oChargecodeRes);
                }
            } else {
                let oChargecodeRes = {
                    total: 0,
                    page: 0,
                    pageSize: aRequestDetails.iLimit,
                    aModuleDetails: []
                };
                return await this._oCommonCls.FunDCT_Handleresponse('Success', 'CHARGECODE', 'CHARGECODE_LISTED', 200, oChargecodeRes);
            }
        } catch (err) {
            return await this._oCommonCls.FunDCT_Handleresponse('Error', 'APPLICATION', 'SERVER_ERROR', HttpStatusCodes.BAD_REQUEST, err);
        }

    }

    public chargeCodeAdd = async (event) => {
        try {
            const body = JSON.parse(event.body);
            const { cCode, cName, cChargegroup, cDefault, iStatusID } = body;
            const aRequestDetails = { cCode, cName, cChargegroup, cDefault, iStatusID: iStatusID, iEnteredby: event.requestContext.authorizer._id, tEntered: new Date() };

            let oChargecode = await GenChargecode.findOne({ cCode: cCode, cName: cName }).lean() as IChargecode;
            if (oChargecode) {
                // Update
                oChargecode = await GenChargecode.findOneAndUpdate(
                    { cCode: cCode },
                    { $set: aRequestDetails },
                    { new: true }
                ).lean() as IChargecode;
                return await this._oCommonCls.FunDCT_Handleresponse('Success', 'CHARGECODE', 'CHARGECODE_UPDATED', 200, oChargecode);
            } else {
                // Create
                oChargecode = new GenChargecode(aRequestDetails);
                await oChargecode.save();
                return await this._oCommonCls.FunDCT_Handleresponse('Success', 'CHARGECODE', 'CHARGECODE_INSERTED', 200, oChargecode);
            }
        } catch (err) {
            if (err.code == 11000) {
                return await this._oCommonCls.FunDCT_Handleresponse('Error', 'CHARGECODE', 'CHARGECODE_ALREADY_EXISTS', HttpStatusCodes.BAD_REQUEST, '');
            }
            else {
                return await this._oCommonCls.FunDCT_Handleresponse('Error', 'APPLICATION', 'SERVER_ERROR', HttpStatusCodes.BAD_REQUEST, 'SERVER_ERROR');
            }
            // await this.FunDCT_Handleresponse('Error', 'APPLICATION', 'SERVER_ERROR', HttpStatusCodes.BAD_REQUEST, 'SERVER_ERROR', oReq, oRes, err);
        }
    }

    public chargeCodeUpdate= async(event)=> {
        try {
            const body = JSON.parse(event.body);
            const { cCode, cName, cChargegroup, cDefault, iStatusID } = body;
            const aMessageFields = {
                cCode,
                cName,
                cChargegroup,
                cDefault,
                iStatusID: iStatusID,
                iUpdatedby: event.requestContext.authorizer._id,
                tUpdated: new Date()
            };

            let oChargecode = await GenChargecode.findOne({ _id: event.pathParameters.id }).lean() as IChargecode;

            if (oChargecode) {
                oChargecode = await GenChargecode.findOneAndUpdate(
                    { _id: event.pathParameters.id },
                    { $set: aMessageFields },
                    { new: true }
                ).lean() as IChargecode;
                return await this._oCommonCls.FunDCT_Handleresponse('Success', 'CHARGECODE', 'CHARGECODE_UPDATED', 200, oChargecode);

            } else {
                return await this._oCommonCls.FunDCT_Handleresponse('Error', 'APPLICATION', 'SERVER_ERROR', HttpStatusCodes.BAD_REQUEST, 'Error: CHARGECODE_UPDATED');
            }
        } catch (err) {
            if (err.code == 11000) {
                return await this._oCommonCls.FunDCT_Handleresponse('Error', 'CHARGECODE', 'CHARGECODE_ALREADY_EXISTS', HttpStatusCodes.BAD_REQUEST, '');
            }
            else {
                return await this._oCommonCls.FunDCT_Handleresponse('Error', 'APPLICATION', 'SERVER_ERROR', HttpStatusCodes.BAD_REQUEST, 'SERVER_ERROR');
            }
            // await this.FunDCT_Handleresponse('Error', 'APPLICATION', 'SERVER_ERROR', HttpStatusCodes.BAD_REQUEST, 'SERVER_ERROR', oReq, oRes, err);
        }
    }

    public chargeCodeDelete = async(event)=> {
        this._oCommonCls.FunDCT_ApiRequest(event)
        let oChargecode = await GenChargecode.findOne({ _id: event.pathParameters.id }).lean() as IChargecode;
        if (oChargecode) {
          await GenChargecode.deleteOne({ _id: event.pathParameters.id }).then(result => {
            return true;
          });
          return await this._oCommonCls.FunDCT_Handleresponse('Success', 'CHARGECODE', 'CHARGECODE_DELETED', 200, event.pathParameters.id);
        } else {
          return await this._oCommonCls.FunDCT_Handleresponse('Error', 'APPLICATION', 'SERVER_ERROR', HttpStatusCodes.BAD_REQUEST, 'Error : CHARGECODE_DELETED');
        }
      }
}