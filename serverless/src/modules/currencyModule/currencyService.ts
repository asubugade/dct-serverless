import { ClsDCT_Common } from "../../commonModule/Class.common";
import HttpStatusCodes from "http-status-codes";
import { getCurrency, getCurrencyCount } from "./currencyDal";
import GenCurrency, { ICurrency } from "../../models/GenCurrency"

export class CurrencyService {
    private _oCommonCls = new ClsDCT_Common();

    public currencyListing = async (event) => {
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

            let iCount: number = await getCurrencyCount(cSearchFilterQuery);

            if (iCount > 0) {
                let oCurrency: any = await getCurrency(aRequestDetails, oSort, cSearchFilterQuery, iCount);
                if (oCurrency) {
                    let oCurrencyRes = {
                        total: iCount,
                        page: aRequestDetails.iOffset,
                        pageSize: aRequestDetails.iLimit,
                        aModuleDetails: oCurrency
                    };
                    return await this._oCommonCls.FunDCT_Handleresponse('Success', 'CURRENCY', 'CURRENCY_LISTED', 200, oCurrencyRes);
                }
            } else {
                let oCurrencyRes = {
                    total: 0,
                    page: 0,
                    pageSize: aRequestDetails.iLimit,
                    aModuleDetails: []
                };
                return await this._oCommonCls.FunDCT_Handleresponse('Success', 'CURRENCY', 'CURRENCY_LISTED', 200, oCurrencyRes);
            }
        } catch (err) {
            return await this._oCommonCls.FunDCT_Handleresponse('Error', 'APPLICATION', 'SERVER_ERROR', HttpStatusCodes.BAD_REQUEST, 'SERVER_ERROR');
        }

    }

    public currencyAdd = async (event) => {
        try {
            const body = JSON.parse(event.body);
            const { cCode, cName, cSymbol, cType, cComment, iStatusID } = body;
            const aRequestDetails = { cCode, cName, cSymbol, cType, cComment, iStatusID: iStatusID, iEnteredby: event.requestContext.authorizer._id, tEntered: new Date() };
            let oCurrency = await GenCurrency.findOne({ cCode: cCode, cName: cName }).lean() as ICurrency;
            if (oCurrency) {
                // Update
                oCurrency = await GenCurrency.findOneAndUpdate(
                    { cCode: cCode },
                    { $set: aRequestDetails },
                    { new: true }
                ).lean() as ICurrency;
                return await this._oCommonCls.FunDCT_Handleresponse('Success', 'CURRENCY', 'CURRENCY_UPDATED', 200, oCurrency);
            } else {
                // Create
                oCurrency = new GenCurrency(aRequestDetails);
                await oCurrency.save();
                return await this._oCommonCls.FunDCT_Handleresponse('Success', 'CURRENCY', 'CURRENCY_INSERTED', 200, oCurrency);
            }
        } catch (err) {
            return await this._oCommonCls.FunDCT_Handleresponse('Error', 'APPLICATION', 'SERVER_ERROR', HttpStatusCodes.BAD_REQUEST, 'SERVER_ERROR');
        }
    }

    public currencyUpdate = async (event) => {
        try {
            const body = JSON.parse(event.body);
            const { cCode, cName, cSymbol, cType, cComment, iStatusID } = body;
            const aCurrencyFields = {
                cCode,
                cName,
                cSymbol,
                cType,
                cComment,
                iStatusID: iStatusID,
                iUpdatedby: event.requestContext.authorizer._id,
                tUpdated: new Date()
            };

            let oCurrency = await GenCurrency.findOne({ _id: event.pathParameters.id }).lean() as ICurrency;

            if (oCurrency) {
                oCurrency = await GenCurrency.findOneAndUpdate(
                    { _id: event.pathParameters.id },
                    { $set: aCurrencyFields },
                    { new: true }
                ).lean() as ICurrency;;
                return await this._oCommonCls.FunDCT_Handleresponse('Success', 'CURRENCY', 'CURRENCY_UPDATED', 200, oCurrency);

            } else {
                return await this._oCommonCls.FunDCT_Handleresponse('Error', 'APPLICATION', 'SERVER_ERROR', HttpStatusCodes.BAD_REQUEST, 'SERVER_ERROR');
            }
        } catch (err) {
            return await this._oCommonCls.FunDCT_Handleresponse('Error', 'APPLICATION', 'SERVER_ERROR', HttpStatusCodes.BAD_REQUEST, 'SERVER_ERROR');
        }
    }

    public currencyDelete = async(event)=> {
        let oCurrency = await GenCurrency.findOne({ _id: event.pathParameters.id }).lean() as ICurrency;
        if (oCurrency) {
          await GenCurrency.deleteOne({ _id: event.pathParameters.id }).then(result => {
            return true;
          });
          return await this._oCommonCls.FunDCT_Handleresponse('Success', 'CURRENCY', 'CURRENCY_DELETED', 200, event.pathParameters.id);
        } else {
          return await this._oCommonCls.FunDCT_Handleresponse('Error', 'APPLICATION', 'SERVER_ERROR', HttpStatusCodes.BAD_REQUEST, 'SERVER_ERROR');
        }
      }
}