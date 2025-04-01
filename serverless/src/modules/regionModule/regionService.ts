import { ClsDCT_Common } from "../../commonModule/Class.common";
import Region, { IRegion } from "../../models/GenRegion";
import { getRegionCount, getRegions } from "./regionDal";
import HttpStatusCodes from "http-status-codes";



export class RegionService {

    private _oCommonCls = new ClsDCT_Common();

    public regionListing = async (event) => {
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

            let iCount: number = await getRegionCount(cSearchFilterQuery);
            if (iCount > 0) {
                let oRegion: any = await getRegions(aRequestDetails, oSort, cSearchFilterQuery, iCount);
                if (oRegion) {
                    let oRegionRes = {
                        total: iCount,
                        page: aRequestDetails.iOffset,
                        pageSize: aRequestDetails.iLimit,
                        aModuleDetails: oRegion
                    };
                    return await this._oCommonCls.FunDCT_Handleresponse('Success', 'REGION', 'REGION_LISTED', 200, oRegionRes);
                }
            } else {
                let oRegionRes = {
                    total: 0,
                    page: 0,
                    pageSize: aRequestDetails.iLimit,
                    aModuleDetails: []
                };
                return await this._oCommonCls.FunDCT_Handleresponse('Success', 'REGION', 'REGION_LISTED', 200, oRegionRes);
            }
        } catch (err) {
            return await this._oCommonCls.FunDCT_Handleresponse('Error', 'APPLICATION', 'SERVER_ERROR', HttpStatusCodes.BAD_REQUEST, 'SERVER_ERROR');
        }

    }

    public regionAdd = async (event) => {
        try {
            const body = JSON.parse(event.body);
            //cTemplateType added by spirgonde for select template checkbox dropdown
            const { cCode, cName, cTemplateType, iStatusID } = body;
            let cTemplateTypeTemp;
            cTemplateTypeTemp = cTemplateType;
            /**
             * if in front end user unchecks Default and if no other template is selected then default is inserted in db
             */
            if (Array.isArray(cTemplateType) && cTemplateType.length <= 2) {
                // cTemplateTypeTemp = '["Default"]';
            }

            const aRequestDetails = { cCode, cName, cTemplateType: JSON.parse(cTemplateType), iStatusID: iStatusID, iEnteredby: event.requestContext.authorizer._id, tEntered: new Date() };

            let oRegion = await Region.findOne({ cCode: cCode, cName: cName }).lean() as IRegion;
            if (oRegion) {
                // Update
                oRegion = await Region.findOneAndUpdate(
                    { cCode: cCode },
                    { $set: aRequestDetails },
                    { new: true }
                ).lean() as IRegion;
                return await this._oCommonCls.FunDCT_Handleresponse('Success', 'REGION', 'REGION_UPDATED', 200, oRegion);
            } else {
                // Create
                oRegion = new Region(aRequestDetails);
                await oRegion.save();
                return await this._oCommonCls.FunDCT_Handleresponse('Success', 'REGION', 'REGION_INSERTED', 200, oRegion);
            }
        } catch (err) {
            if (err.code == 11000) {
                return await this._oCommonCls.FunDCT_Handleresponse('Error', 'REGION', 'REGION_ALREADY_EXISTS', HttpStatusCodes.BAD_REQUEST, '');
            }
            else {
                return await this._oCommonCls.FunDCT_Handleresponse('Error', 'APPLICATION', 'SERVER_ERROR', HttpStatusCodes.BAD_REQUEST, 'SERVER_ERROR');
            }
        }
    }


    public regionUpdate = async (event) => {
        try {
            const body = JSON.parse(event.body);
            //cTemplateType added by spirgonde for select template checkbox dropdown
            const { cCode, cName, cTemplateType, iStatusID } = body;
            let cTemplateTypeTemp;
            cTemplateTypeTemp = cTemplateType;
            /**
             * if in front end user unchecks Default and if no other template is selected then default is inserted in db
             */
            if (cTemplateType == null) {
                cTemplateTypeTemp = '["Default"]';
            }

            const aRegionFields = {
                cCode,
                cName,
                cTemplateType: cTemplateTypeTemp,
                iStatusID: iStatusID,
                iUpdatedby: event.requestContext.authorizer._id,
                tUpdated: new Date()
            };

            let oRegion = await Region.findOne({ _id: event.pathParameters.id }).lean() as IRegion;

            if (oRegion) {
                oRegion = await Region.findOneAndUpdate(
                    { _id: event.pathParameters.id },
                    { $set: aRegionFields },
                    { new: true }
                ).lean() as IRegion;
                return await this._oCommonCls.FunDCT_Handleresponse('Success', 'REGION', 'REGION_UPDATED', 200, oRegion);

            } else {
                return await this._oCommonCls.FunDCT_Handleresponse('Error', 'APPLICATION', 'SERVER_ERROR', HttpStatusCodes.BAD_REQUEST, 'SERVER_ERROR');
            }
        } catch (err) {
            return await this._oCommonCls.FunDCT_Handleresponse('Error', 'APPLICATION', 'SERVER_ERROR', HttpStatusCodes.BAD_REQUEST, 'SERVER_ERROR');
        }
    }


    public regionDelete = async (event) => {
        let oRegion = await Region.findOne({ _id: event.pathParameters.id }).lean() as IRegion;
        if (oRegion) {
            await Region.deleteOne({ _id: event.pathParameters.id }).then(result => {
                return true;
            });
            return await this._oCommonCls.FunDCT_Handleresponse('Success', 'REGION', 'REGION_DELETED', 200, event.pathParameters.id);
        } else {
            return await this._oCommonCls.FunDCT_Handleresponse('Error', 'APPLICATION', 'SERVER_ERROR', HttpStatusCodes.BAD_REQUEST, 'SERVER_ERROR');
        }
    }
}