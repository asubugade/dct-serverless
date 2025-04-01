import { ClsDCT_Common } from "../../commonModule/Class.common";
import HttpStatusCodes from "http-status-codes";
import { getAccessType, getAccessTypeCount } from "./accessTypeDal";
import GenAccessType, { IAccessType } from "../../models/GenAccessType";

export class AccessTypeService {
    private _oCommonCls = new ClsDCT_Common();

    public accessTypeListing = async (event) => {
        try {
            const body = JSON.parse(event.body)
            const { iOffset, iLimit, iOffsetLimit, cSearchFilter, cSort, cSortOrder } = body;
            const aRequestDetails = { iOffset, iLimit, iOffsetLimit, cSearchFilter, cSort, cSortOrder };

            let cSearchFilterQuery: any;
            if (aRequestDetails.cSearchFilter) {
                cSearchFilterQuery = { $match: { $or: [{ "cAccessCode": { "$regex": aRequestDetails.cSearchFilter, "$options": "i" } }, { "cAccessName": { "$regex": aRequestDetails.cSearchFilter, "$options": "i" } }] } };
            } else {
                cSearchFilterQuery = { $match: {} };
            }

            let oSort = {};
            if (aRequestDetails.cSort) {
                oSort[aRequestDetails.cSort] = aRequestDetails.cSortOrder;
            } else {
                oSort['_id'] = -1;
            }

            let iCount: number = await getAccessTypeCount(cSearchFilterQuery);
            if (iCount > 0) {
                let oAccesstype: any = await getAccessType(aRequestDetails, oSort, cSearchFilterQuery, iCount);

                if (oAccesstype) {
                    let oAccesstypeRes = {
                        total: iCount,
                        page: aRequestDetails.iOffset,
                        pageSize: aRequestDetails.iLimit,
                        aModuleDetails: oAccesstype
                    };
                    return await this._oCommonCls.FunDCT_Handleresponse('Success', 'USERTYPE', 'USERTYPE_LISTED', 200, oAccesstypeRes);
                }
            } else {
                let oAccesstypeRes = {
                    total: 0,
                    page: 0,
                    pageSize: aRequestDetails.iLimit,
                    aModuleDetails: []
                };
                return await this._oCommonCls.FunDCT_Handleresponse('Success', 'USERTYPE', 'USERTYPE_LISTED', 200, oAccesstypeRes);
            }
        } catch (err) {
            return await this._oCommonCls.FunDCT_Handleresponse('Error', 'APPLICATION', 'SERVER_ERROR', HttpStatusCodes.BAD_REQUEST, 'SERVER_ERROR');
        }
    }

    public accesstypeAdd = async (event) => {
        try {
            const body = JSON.parse(event.body);
            const { cAccessCode, cAccessName, cAccessDesc, iStatusID } = body;
            const aRequestDetails = { cAccessCode, cAccessName, cAccessDesc, iStatusID: iStatusID, iEnteredby: event.requestContext.authorizer._id, tEntered: new Date() };

            let oAccesstype = await GenAccessType.findOne({ cAccessCode: cAccessCode, cAccessName: cAccessName }).lean() as IAccessType;
            if (oAccesstype) {
                // Update
                oAccesstype = await GenAccessType.findOneAndUpdate(
                    { cAccessCode: cAccessCode },
                    { $set: aRequestDetails },
                    { new: true }
                ).lean() as IAccessType;
                return await this._oCommonCls.FunDCT_Handleresponse('Success', 'USERTYPE', 'USERTYPE_UPDATED', 200, oAccesstype);
            } else {
                // Create
                oAccesstype = new GenAccessType(aRequestDetails);
                await oAccesstype.save();
                return await this._oCommonCls.FunDCT_Handleresponse('Success', 'USERTYPE', 'USERTYPE_INSERTED', 200, oAccesstype);
            }
        } catch (err) {
            return await this._oCommonCls.FunDCT_Handleresponse('Error', 'APPLICATION', 'SERVER_ERROR', HttpStatusCodes.BAD_REQUEST, 'SERVER_ERROR');
        }
    }

    public accesstypeUpdate = async (event) => {
        try {
            const body = JSON.parse(event.body);
            const { cAccessCode, cAccessName, cAccessDesc, iStatusID } = body;
            const aAccesstypeFields = {
                cAccessCode,
                cAccessName,
                cAccessDesc,
                iStatusID: iStatusID,
                iUpdatedby: event.requestContext.authorizer._id,
                tUpdated: new Date()
            };

            let oAccesstype = await GenAccessType.findOne({ _id: event.pathParameters.id }).lean() as IAccessType;

            if (oAccesstype) {
                oAccesstype = await GenAccessType.findOneAndUpdate(
                    { _id: event.pathParameters.id },
                    { $set: aAccesstypeFields },
                    { new: true }
                ).lean() as IAccessType;
                return await this._oCommonCls.FunDCT_Handleresponse('Success', 'USERTYPE', 'USERTYPE_UPDATED', 200, oAccesstype);

            } else {
                return await this._oCommonCls.FunDCT_Handleresponse('Error', 'APPLICATION', 'SERVER_ERROR', HttpStatusCodes.BAD_REQUEST, 'SERVER_ERROR');
            }
        } catch (err) {
            return await this._oCommonCls.FunDCT_Handleresponse('Error', 'APPLICATION', 'SERVER_ERROR', HttpStatusCodes.BAD_REQUEST, 'SERVER_ERROR');
        }
    }

    public accesstypeDelete = async (event) => {
        let oAccesstype = await GenAccessType.findOne({ _id: event.pathParameters.id }).lean() as IAccessType;
        if (oAccesstype) {
            await GenAccessType.deleteOne({ _id: event.pathParameters.id }).then(result => {
                return true;
            });
            return await this._oCommonCls.FunDCT_Handleresponse('Success', 'USERTYPE', 'USERTYPE_DELETED', 200, event.pathParameters.id);
        } else {
            return await this._oCommonCls.FunDCT_Handleresponse('Error', 'APPLICATION', 'SERVER_ERROR', HttpStatusCodes.BAD_REQUEST, 'SERVER_ERROR');
        }

    }
}