import { Types } from "mongoose";
import { ClsDCT_Common } from "../../commonModule/Class.common";
import HttpStatusCodes from "http-status-codes";
import { getEmailtemplates, getEmailtemplatesCount } from "./emailTemplateDal";
import Emailtemplates, { IEmailtemplates } from "../../models/GenEmailtemplates";
const _ = require('lodash');




export class EmailTemplateService {
    private _oCommonCls = new ClsDCT_Common();


    public emailTemplatesListing = async (event) => {
        try {

            const body = JSON.parse(event.body);
            const { iOffset, iLimit, iOffsetLimit, cSearchFilter, cSort, cSortOrder } = body;
            const aRequestDetails = { iOffset, iLimit, iOffsetLimit, cSearchFilter, cSort, cSortOrder };

            let cSearchFilterQuery: any;
            if (aRequestDetails.cSearchFilter) {
                cSearchFilterQuery = { $match: { $or: [{ "iProcessID": { "$regex": aRequestDetails.cSearchFilter, "$options": "i" } }, { "cSubject": { "$regex": aRequestDetails.cSearchFilter, "$options": "i" } }] } };
            } else {
                cSearchFilterQuery = { $match: {} };
            }

            let oSort = {};
            if (aRequestDetails.cSort) {
                oSort[aRequestDetails.cSort] = aRequestDetails.cSortOrder;
            } else {
                oSort['_id'] = -1;
            }

            let iCount: number = await getEmailtemplatesCount(cSearchFilterQuery);
            if (iCount > 0) {
                let oEmailtemplates: any = await getEmailtemplates(aRequestDetails, oSort, cSearchFilterQuery, iCount);
                if (oEmailtemplates) {
                    let oEmailtemplatesRes = {
                        total: iCount,
                        page: aRequestDetails.iOffset,
                        pageSize: aRequestDetails.iLimit,
                        aModuleDetails: oEmailtemplates
                    };
                    return await this._oCommonCls.FunDCT_Handleresponse('Success', 'EMAIL_TEMPLATES', 'EMAILTEMPLATES_LISTED', 200, oEmailtemplatesRes);
                }
            } else {
                let oEmailtemplatesRes = {
                    total: 0,
                    page: 0,
                    pageSize: aRequestDetails.iLimit,
                    aModuleDetails: []
                };
                return await this._oCommonCls.FunDCT_Handleresponse('Success', 'EMAIL_TEMPLATES', 'EMAILTEMPLATES_LISTED', 200, oEmailtemplatesRes);
            }
        } catch (err) {
            return await this._oCommonCls.FunDCT_Handleresponse('Error', 'APPLICATION', 'SERVER_ERROR', HttpStatusCodes.BAD_REQUEST, 'SERVER_ERROR');
        }

    }

    public emailtemplatesAdd = async (event) => {
        try {
            const body = JSON.parse(event.body);

            //modify by jraisoni
            const { iProcessID, cEmailType, cSubject, cFromEmailText, cEmailBody, cFrom, cBcc, iStatusID } = body;
            const aRequestDetails = { iProcessID, cEmailType, cSubject, cFromEmailText, cEmailBody, cFrom, cBcc, iStatusID: iStatusID, iEnteredby: event.requestContext.authorizer._id, tEntered: new Date() };

            //modify by jraisoni
            let oEmailtemplates = await Emailtemplates.findOne({ iProcessID: iProcessID, cFrom: cFrom, iStatusID: iStatusID }).lean() as IEmailtemplates;
            if (oEmailtemplates) {
                // Update
                oEmailtemplates = await Emailtemplates.findOneAndUpdate(
                    { iProcessID: iProcessID },
                    { $set: aRequestDetails },
                    { new: true }
                ).lean() as IEmailtemplates;
                return await this._oCommonCls.FunDCT_Handleresponse('Success', 'EMAIL_TEMPLATES', 'EMAILTEMPLATES_UPDATED', 200, oEmailtemplates);
            } else {
                // Create
                oEmailtemplates = new Emailtemplates(aRequestDetails);
                await oEmailtemplates.save();
                return await this._oCommonCls.FunDCT_Handleresponse('Success', 'EMAIL_TEMPLATES', 'EMAILTEMPLATES_INSERTED', 200, oEmailtemplates);
            }
        } catch (err) {
            return await this._oCommonCls.FunDCT_Handleresponse('Error', 'APPLICATION', 'SERVER_ERROR', HttpStatusCodes.BAD_REQUEST, 'SERVER_ERROR');
        }
    }

    public emailtemplatesUpdate = async (event) => {
        try {
            const body = JSON.parse(event.body);
            const { iProcessID, cEmailType, cSubject, cFromEmailText, cEmailBody, cFrom, cBcc, iStatusID } = body;
            const aEmailtemplatesFields = { iProcessID, cEmailType, cSubject, cFromEmailText, cEmailBody, cFrom, cBcc, iStatusID: iStatusID, iUpdatedby: event.requestContext.authorizer._id, tUpdated: new Date() };
            let oEmailtemplates = await Emailtemplates.findOne({ _id: event.pathParameters.id }).lean() as IEmailtemplates;

            if (oEmailtemplates) {
                oEmailtemplates = await Emailtemplates.findOneAndUpdate(
                    { _id: event.pathParameters.id },
                    { $set: aEmailtemplatesFields },
                    { new: true }
                ).lean() as IEmailtemplates;
                return await this._oCommonCls.FunDCT_Handleresponse('Success', 'EMAIL_TEMPLATES', 'EMAILTEMPLATES_UPDATED', 200, oEmailtemplates);

            } else {
                return await this._oCommonCls.FunDCT_Handleresponse('Error', 'APPLICATION', 'SERVER_ERROR', HttpStatusCodes.BAD_REQUEST, 'SERVER_ERROR');
            }
        } catch (err) {
            return await this._oCommonCls.FunDCT_Handleresponse('Error', 'APPLICATION', 'SERVER_ERROR', HttpStatusCodes.BAD_REQUEST, 'SERVER_ERROR');
        }
    }

    public emailtemplatesDelete = async (event) => {
        let oEmailtemplates = await Emailtemplates.findOne({ _id: event.pathParameters.id }).lean() as IEmailtemplates;
        if (oEmailtemplates) {
            await Emailtemplates.deleteOne({ _id: event.pathParameters.id }).then(result => {
                return true;
            });
            return await this._oCommonCls.FunDCT_Handleresponse('Success', 'EMAIL_TEMPLATES', 'EMAILTEMPLATES_DELETED', 200, event.pathParameters.id);
        } else {
            return await this._oCommonCls.FunDCT_Handleresponse('Error', 'APPLICATION', 'SERVER_ERROR', HttpStatusCodes.BAD_REQUEST, 'SERVER_ERROR');
        }
    }

} 