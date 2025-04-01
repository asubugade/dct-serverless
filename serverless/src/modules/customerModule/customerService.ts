import { ClsDCT_Common } from "../../commonModule/Class.common";
import HttpStatusCodes from "http-status-codes";
import { getCustomer, getCustomerCount } from "./customerDal";
import GenCustomer, { ICustomer } from "../../models/GenCustomer";

export class CustomerService {
    private _oCommonCls = new ClsDCT_Common();
    public customerListing = async (event) => {
        try {
            const body = JSON.parse(event.body);
            const { iOffset, iLimit, iOffsetLimit, cSearchFilter, cSort, cSortOrder } = body;
            const aRequestDetails = { iOffset, iLimit, iOffsetLimit, cSearchFilter, cSort, cSortOrder };

            let cSearchFilterQuery: any;
            if (aRequestDetails.cSearchFilter) {
                cSearchFilterQuery = { $match: { $or: [{ "cAliascode": { "$regex": aRequestDetails.cSearchFilter, "$options": "i" } }, { "cAliasname": { "$regex": aRequestDetails.cSearchFilter, "$options": "i" } }] } };
            } else {
                cSearchFilterQuery = { $match: {} };
            }

            let oSort = {};
            if (aRequestDetails.cSort) {
                oSort[aRequestDetails.cSort] = aRequestDetails.cSortOrder;
            } else {
                oSort['_id'] = -1;
            }

            let iCount: number = await getCustomerCount(cSearchFilterQuery);
            if (iCount > 0) {
                let oCustomer: any = await getCustomer(aRequestDetails, oSort, cSearchFilterQuery, iCount);
                if (oCustomer) {
                    let oCustomerRes = {
                        total: iCount,
                        page: aRequestDetails.iOffset,
                        pageSize: aRequestDetails.iLimit,
                        aModuleDetails: oCustomer
                    };
                    return await this._oCommonCls.FunDCT_Handleresponse('Success', 'CUSTOMER', 'CUSTOMER_LISTED', 200, oCustomerRes);
                }
            } else {
                let oCustomerRes = {
                    total: 0,
                    page: 0,
                    pageSize: aRequestDetails.iLimit,
                    aModuleDetails: []
                };
                return await this._oCommonCls.FunDCT_Handleresponse('Success', 'CUSTOMER', 'CUSTOMER_LISTED', 200, oCustomerRes);
            }
        } catch (err) {
            return await this._oCommonCls.FunDCT_Handleresponse('Error', 'APPLICATION', 'SERVER_ERROR', HttpStatusCodes.BAD_REQUEST, 'SERVER_ERROR');
        }

    }

    public customerAdd = async (event) => {
        try {
            const body = JSON.parse(event.body);
            const { cAliascode, cAliasname, cIsGlobal, iStatusID, cTemplateType } = body;

            const aRequestDetails = { cAliascode, cAliasname, cIsGlobal, iStatusID, iEnteredby: event.requestContext.authorizer._id, tEntered: new Date(), cTemplateType: JSON.parse(cTemplateType) };

            let oCustomer = await GenCustomer.findOne({ cAliascode: cAliascode, cAliasname: cAliasname }).lean() as ICustomer;
            if (oCustomer) {
                // Update
                oCustomer = await GenCustomer.findOneAndUpdate(
                    { cAliascode: cAliascode },
                    { $set: aRequestDetails },
                    { new: true }
                ).lean() as ICustomer;
                return await this._oCommonCls.FunDCT_Handleresponse('Success', 'CUSTOMER', 'CUSTOMER_UPDATED', 200, oCustomer);
            } else {
                // Create
                oCustomer = new GenCustomer(aRequestDetails);
                await oCustomer.save();
                return await this._oCommonCls.FunDCT_Handleresponse('Success', 'CUSTOMER', 'CUSTOMER_INSERTED', 200, oCustomer);
            }
        } catch (err) {
            if (err.code == 11000) {
                return await this._oCommonCls.FunDCT_Handleresponse('Error', 'CUSTOMER', 'CUSTOMER_ALREADY_EXISTS', HttpStatusCodes.BAD_REQUEST, '');
            }
            else {
                return await this._oCommonCls.FunDCT_Handleresponse('Error', 'APPLICATION', 'SERVER_ERROR', HttpStatusCodes.BAD_REQUEST, 'SERVER_ERROR');
            }
            //  await this.FunDCT_Handleresponse('Error', 'APPLICATION', 'SERVER_ERROR', HttpStatusCodes.BAD_REQUEST, 'SERVER_ERROR', req, res);
        }
    }

    public customerUpdate = async (event) => {
        try {
            const body = JSON.parse(event.body);
            const { cAliascode, cAliasname, cIsGlobal, iStatusID, cTemplateType } = body;
            const aMessageFields = { cAliascode, cAliasname, cIsGlobal, iStatusID, iUpdatedby: event.requestContext.authorizer._id, tUpdated: new Date(), cTemplateType: JSON.parse(cTemplateType) };

            let oCustomer = await GenCustomer.findOne({ _id: event.pathParameters.id }).lean() as ICustomer;

            if (oCustomer) {
                oCustomer = await GenCustomer.findOneAndUpdate(
                    { _id: event.pathParameters.id },
                    { $set: aMessageFields },
                    { new: true }
                ).lean() as ICustomer;
                return await this._oCommonCls.FunDCT_Handleresponse('Success', 'CUSTOMER', 'CUSTOMER_UPDATED', 200, oCustomer);

            } else {
                return await this._oCommonCls.FunDCT_Handleresponse('Error', 'APPLICATION', 'SERVER_ERROR', HttpStatusCodes.BAD_REQUEST, 'SERVER_ERROR');
            }
        } catch (err) {
            if (err.code == 11000) {
                return await this._oCommonCls.FunDCT_Handleresponse('Error', 'CUSTOMER', 'CUSTOMER_ALREADY_EXISTS', HttpStatusCodes.BAD_REQUEST, '');
            }
            else {
                return await this._oCommonCls.FunDCT_Handleresponse('Error', 'APPLICATION', 'SERVER_ERROR', HttpStatusCodes.BAD_REQUEST, 'SERVER_ERROR');
            }
            //  await this.FunDCT_Handleresponse('Error', 'APPLICATION', 'SERVER_ERROR', HttpStatusCodes.BAD_REQUEST, 'SERVER_ERROR', req, res);
        }
    }

    public customerDelete = async (event) => {
        let oCustomer = await GenCustomer.findOne({ _id: event.pathParameters.id }).lean() as ICustomer;
        if (oCustomer) {
            await GenCustomer.deleteOne({ _id: event.pathParameters.id }).then(result => {
                return true;
            });
            return await this._oCommonCls.FunDCT_Handleresponse('Success', 'CUSTOMER', 'CUSTOMER_DELETED', 200, event.pathParameters.id);
        } else {
            return await this._oCommonCls.FunDCT_Handleresponse('Error', 'APPLICATION', 'SERVER_ERROR', HttpStatusCodes.BAD_REQUEST, 'SERVER_ERROR');
        }
    }
}