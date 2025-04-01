import { ClsDCT_Common } from "../../commonModule/Class.common";
import HttpStatusCodes from "http-status-codes";
import { getCountry, getCountryCount } from "./countryDal";
import GenCountry, { ICountry } from "../../models/GenCountry"


export class CountryService {
    private _oCommonCls = new ClsDCT_Common();

    public countryListing = async (event) => {
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

            let iCount: number = await getCountryCount(cSearchFilterQuery);
            if (iCount > 0) {
                let oCountry: any = await getCountry(aRequestDetails, oSort, cSearchFilterQuery, iCount);

                if (oCountry) {
                    let oCountryRes = {
                        total: iCount,
                        page: aRequestDetails.iOffset,
                        pageSize: aRequestDetails.iLimit,
                        aModuleDetails: oCountry
                    };
                    return await this._oCommonCls.FunDCT_Handleresponse('Success', 'COUNTRY', 'COUNTRY_LISTED', 200, oCountryRes);
                }
            } else {
                let oCountryRes = {
                    total: 0,
                    page: 0,
                    pageSize: aRequestDetails.iLimit,
                    aModuleDetails: []
                };
                return await this._oCommonCls.FunDCT_Handleresponse('Success', 'COUNTRY', 'COUNTRY_LISTED', 200, oCountryRes);
            }
        } catch (err) {
            return await this._oCommonCls.FunDCT_Handleresponse('Error', 'APPLICATION', 'SERVER_ERROR', HttpStatusCodes.BAD_REQUEST, 'SERVER_ERROR');
        }
    }


    public countryAdd = async (event) => {
        try {
            const body = JSON.parse(event.body);
            const { iRegionID, cCode, cName, cCurrencycode, cDefaultcountry, iStatusID } = body;
            const aRequestDetails = { iRegionID, cCode, cName, cCurrencycode, cDefaultcountry, iStatusID: iStatusID, iEnteredby: event.requestContext.authorizer._id, tEntered: new Date() };

            let oCountry = await GenCountry.findOne({ cCode: cCode, cName: cName }).lean() as ICountry;
            if (oCountry) {
                // Update
                oCountry = await GenCountry.findOneAndUpdate(
                    { cCode: cCode },
                    { $set: aRequestDetails },
                    { new: true }
                ).lean() as ICountry;
                return await this._oCommonCls.FunDCT_Handleresponse('Success', 'COUNTRY', 'COUNTRY_UPDATED', 200, oCountry);
            } else {
                // Create
                oCountry = new GenCountry(aRequestDetails);
                await oCountry.save();
                return await this._oCommonCls.FunDCT_Handleresponse('Success', 'COUNTRY', 'COUNTRY_INSERTED', 200, oCountry);
            }
        } catch (err) {
            if (err.code == 11000) {
                return await this._oCommonCls.FunDCT_Handleresponse('Error', 'COUNTRY', 'COUNTRY_ALREADY_EXISTS', HttpStatusCodes.BAD_REQUEST, '');
            }
            else {
                return await this._oCommonCls.FunDCT_Handleresponse('Error', 'APPLICATION', 'SERVER_ERROR', HttpStatusCodes.BAD_REQUEST, 'SERVER_ERROR');
            }
        }
    }


    public countryUpdate = async (event) => {
        try {
            const body = JSON.parse(event.body);

            const { iRegionID, cCode, cName, cCurrencycode, cDefaultcountry, iStatusID } = body;
            const aCountryFields = { iRegionID, cCode, cName, cCurrencycode, cDefaultcountry, iStatusID: iStatusID, iUpdatedby: event.requestContext.authorizer._id, tUpdated: new Date() };

            let oCountry = await GenCountry.findOne({ _id: event.pathParameters.id }).lean() as ICountry;

            if (oCountry) {
                oCountry = await GenCountry.findOneAndUpdate(
                    { _id: event.pathParameters.id },
                    { $set: aCountryFields },
                    { new: true }
                ).lean() as ICountry;
                return await this._oCommonCls.FunDCT_Handleresponse('Success', 'COUNTRY', 'COUNTRY_UPDATED', 200, oCountry);

            } else {
                return await this._oCommonCls.FunDCT_Handleresponse('Error', 'APPLICATION', 'SERVER_ERROR', HttpStatusCodes.BAD_REQUEST, 'SERVER_ERROR');
            }
        } catch (err) {
            return await this._oCommonCls.FunDCT_Handleresponse('Error', 'APPLICATION', 'SERVER_ERROR', HttpStatusCodes.BAD_REQUEST, 'SERVER_ERROR');
        }
    }


    public countryDelete = async (event) => {
        let oCountry = await GenCountry.findOne({ _id: event.pathParameters.id }).lean() as ICountry;
        if (oCountry) {
            await GenCountry.deleteOne({ _id: event.pathParameters.id }).then(result => {
                return true;
            });
            return await this._oCommonCls.FunDCT_Handleresponse('Success', 'COUNTRY', 'COUNTRY_DELETED', 200, event.pathParameters.id);
        } else {
            return await this._oCommonCls.FunDCT_Handleresponse('Error', 'APPLICATION', 'SERVER_ERROR', HttpStatusCodes.BAD_REQUEST, 'SERVER_ERROR');
        }
    }
}