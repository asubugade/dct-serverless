import { ClsDCT_Common } from "../../commonModule/Class.common";
import HttpStatusCodes from "http-status-codes";
import { getRateBasis, getRateBasisCount } from "./rateBasisDal";
import GenRatebasis, { IRatebasis } from "../../models/GenRatebasis"



export class RateBasisService {
    private _oCommonCls = new ClsDCT_Common();

    public rateBasisListing = async (event) => {
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

            let iCount: number = await getRateBasisCount(cSearchFilterQuery);

            if (iCount > 0) {
                let oRatebasis: any = await getRateBasis(aRequestDetails, oSort, cSearchFilterQuery, iCount);
                if (oRatebasis) {
                    let oratebasisRes = {
                        total: iCount,
                        page: aRequestDetails.iOffset,
                        pageSize: aRequestDetails.iLimit,
                        aModuleDetails: oRatebasis
                    };
                    return await this._oCommonCls.FunDCT_Handleresponse('Success', 'RATE_BASIS', 'RATEBASIS_LISTED', 200, oratebasisRes);
                }
            } else {
                let oratebasisRes = {
                    total: 0,
                    page: 0,
                    pageSize: aRequestDetails.iLimit,
                    aModuleDetails: []
                };
                return await this._oCommonCls.FunDCT_Handleresponse('Success', 'RATE_BASIS', 'RATEBASIS_LISTED', 200, oratebasisRes);
            }
        } catch (err) {
            return await this._oCommonCls.FunDCT_Handleresponse('Error', 'APPLICATION', 'SERVER_ERROR', HttpStatusCodes.BAD_REQUEST, err);
        }

    }

    public rateBasisAdd = async (event) => {
        try {
            const body = JSON.parse(event.body);
            const { cBasis, cCode, cName, cComment, iBasisGroupID, cGlobalConversion, cCSRFQConversion, bInland, iStatusID } = body;
            const aRequestDetails = { cBasis, cCode, cName, cComment, iBasisGroupID, cGlobalConversion, cCSRFQConversion, bInland, iStatusID: iStatusID, iEnteredby: event.requestContext.authorizer._id, tEntered: new Date() };
            let oRatebasis = await GenRatebasis.findOne({ cCode: cCode, cName: cName }).lean() as IRatebasis;
            if (oRatebasis) {
                // Update
                oRatebasis = await GenRatebasis.findOneAndUpdate(
                    { cCode: cCode },
                    { $set: aRequestDetails },
                    { new: true }
                ).lean() as IRatebasis;
                return await this._oCommonCls.FunDCT_Handleresponse('Success', 'RATE_BASIS', 'RATEBASIS_UPDATED', 200, oRatebasis);
            } else {
                // Create
                oRatebasis = new GenRatebasis(aRequestDetails);
                await oRatebasis.save();
                return await this._oCommonCls.FunDCT_Handleresponse('Success', 'RATE_BASIS', 'RATEBASIS_INSERTED', 200, oRatebasis);
            }
        } catch (err) {
            return await this._oCommonCls.FunDCT_Handleresponse('Error', 'APPLICATION', 'SERVER_ERROR', HttpStatusCodes.BAD_REQUEST, err);
        }
    }

    public rateBasisUpdate = async (event) => {
        try {
            const body = JSON.parse(event.body);
            const { cBasis, cCode, cName, cComment, iBasisGroupID, cGlobalConversion, cCSRFQConversion, bInland, iStatusID } = body;
            const aRatebasisFields = {
                cBasis,
                cCode,
                cName,
                cComment,
                iBasisGroupID,
                cGlobalConversion,
                cCSRFQConversion,
                bInland,
                iStatusID: iStatusID,
                iUpdatedby: event.requestContext.authorizer._id,
                tUpdated: new Date()
            };

            let oRatebasis = await GenRatebasis.findOne({ _id: event.pathParameters.id }).lean() as IRatebasis;

            if (oRatebasis) {
                oRatebasis = await GenRatebasis.findOneAndUpdate(
                    { _id: event.pathParameters.id },
                    { $set: aRatebasisFields },
                    { new: true }
                ).lean() as IRatebasis;;
                return await this._oCommonCls.FunDCT_Handleresponse('Success', 'RATE_BASIS', 'RATEBASIS_UPDATED', 200, oRatebasis);

            } else {
                return await this._oCommonCls.FunDCT_Handleresponse('Error', 'APPLICATION', 'SERVER_ERROR', HttpStatusCodes.BAD_REQUEST, 'Error : RATEBASIS_UPDATED');
            }
        } catch (err) {
            return await this._oCommonCls.FunDCT_Handleresponse('Error', 'APPLICATION', 'SERVER_ERROR', HttpStatusCodes.BAD_REQUEST, err);
        }
    }

    public rateBasisDelete = async (event) => {
        let oRatebasis = await GenRatebasis.findOne({ _id: event.pathParameters.id }).lean() as IRatebasis;
        if (oRatebasis) {
            await GenRatebasis.deleteOne({ _id: event.pathParameters.id }).then(result => {
                return true;
            });
            return await this._oCommonCls.FunDCT_Handleresponse('Success', 'RATE_BASIS', 'RATEBASIS_DELETED', 200, event.pathParameters.id);
        } else {
            return await this._oCommonCls.FunDCT_Handleresponse('Error', 'APPLICATION', 'SERVER_ERROR', HttpStatusCodes.BAD_REQUEST, 'Error : RATEBASIS_DELETED');
        }
    }
}