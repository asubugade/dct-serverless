import { ClsDCT_Common } from "../../commonModule/Class.common";
import { ClsDCT_ManageTemplate } from "../../commonModule/Class.managetemplate";
import Status, { IStatus } from "../../models/GenStatus";
import Template from "../../models/GenTemplate";
import TemplateType, { ITemplateType } from "../../models/GenTemplateType";
import User from "../../models/GenUser";
import TmplConsolidationReq from "../../models/TmplConsolidationReq";
import { consolidationLog, consolidationLogCount } from "./consolidateTemplateDal";
import HttpStatusCodes from "http-status-codes";


export class ConsolidateTemplateService {

    private _oCommonCls = new ClsDCT_Common();
    private clsDCT_ManageTemplate = new ClsDCT_ManageTemplate()
    
    public consolidationLogListing = async (event) => {
        try {
            const { iOffset, iLimit, iOffsetLimit, cSearchFilter, cSort, cSortOrder, cTemplateTypes } = JSON.parse(event.body);
            const aRequestDetails = { iOffset, iLimit, iOffsetLimit, cSearchFilter, cSort, cSortOrder };

            let cSearchFilterQuery: any;
            if (aRequestDetails.cSearchFilter) {
                //"cTemplateName" added by spirgonde for template upload log  searchfilter task
                cSearchFilterQuery = { $match: { $or: [{ "iTemplateID": { "$regex": aRequestDetails.cSearchFilter, "$options": "i" } }, { "cTemplateName": { "$regex": aRequestDetails.cSearchFilter, "$options": "i" } }] } };
            } else {
                cSearchFilterQuery = { $match: {} };
            }

            let oSort = {};
            if (aRequestDetails.cSort) {
                oSort[aRequestDetails.cSort] = aRequestDetails.cSortOrder;
            } else {
                oSort['_id'] = -1;
            }

            const cToken = event.headers?.['x-wwadct-token'] || event.headers?.['X-WWADCT-TOKEN'];
            await this._oCommonCls.FunDCT_SetCurrentUserDetails(cToken);
            this._oCommonCls.FunDCT_ApiRequest(event)
            let oCurrentUserType = await this._oCommonCls.FunDCT_GetAccessType();
            let cUserType = oCurrentUserType[0].cAccessCode;
            let cCompanyname: string = this._oCommonCls.oCurrentUserDetails.cCompanyname;
            const templateTypeArray: any[] = [];
            // if(cUserType!="Admin" && cCompanyname !=undefined){
            const templateType = this._oCommonCls.oCurrentUserDetails.cTemplateType;
            if (Array.isArray(templateType)) {
                for (const objectId of templateType) {
                    let oUserTemplateTypeDetails = await TemplateType.findOne({ _id: objectId }).lean() as ITemplateType;
                    templateTypeArray.push(oUserTemplateTypeDetails.cTemplateType);
                }
            }
            // }
            // let iCount: number = await this.FunDCT_ConsolidationLogCount(cSearchFilterQuery ,cTemplateTypes && cTemplateTypes.length ?cTemplateTypes : templateTypeArray);
            let iCount: number = await consolidationLogCount(
                cSearchFilterQuery,
                Array.isArray(cTemplateTypes) && cTemplateTypes.length > 0 ? cTemplateTypes : templateTypeArray
            );
            if (iCount > 0) {
                let templateIDs: any[];
                let templateArray: any = [];
                let oConsolidationLogListing: any = await consolidationLog(aRequestDetails, oSort, cSearchFilterQuery, iCount, cTemplateTypes && cTemplateTypes.length ? cTemplateTypes : templateTypeArray);
                if (oConsolidationLogListing) {
                    templateIDs = oConsolidationLogListing.map((item: any) => item.iTemplateID);
                    const oTemplate = await Template.find({ _id: { $in: templateIDs }, iTempActiveStatus: 0 });

                    if (oTemplate.length > 0) {
                        templateArray = oTemplate.map(template => template);
                    }

                    let matchingTemplateNames;
                    if (cTemplateTypes && cTemplateTypes.length > 0) {
                        matchingTemplateNames = templateArray
                            .filter(template => cTemplateTypes.includes(template.cTemplateType))
                            .map(template => template.cTemplateName);
                    }
                    else {
                        matchingTemplateNames = templateArray
                            .filter(template => templateTypeArray.includes(template.cTemplateType))
                            .map(template => template.cTemplateName);
                    }

                    let oTemplateUploadLogListingResp;
                    if (matchingTemplateNames && matchingTemplateNames.length > 0) {
                        oTemplateUploadLogListingResp = oConsolidationLogListing.filter(template =>
                            matchingTemplateNames.includes(template.cTemplateName)
                        );
                        oConsolidationLogListing = oTemplateUploadLogListingResp;
                    }
                    else {
                        oConsolidationLogListing = [];
                    }

                    const enteredByIds = oConsolidationLogListing.map(item => item.iEnteredby.toString());
                    let users = await User.find({ _id: { $in: enteredByIds } }).lean();
                    oConsolidationLogListing = oConsolidationLogListing.map(item => {
                        const user = users.find(u => u._id.toString() === item.iEnteredby.toString());
                        if (user) {
                            item.cRequestedBy = user.cName; // Assuming cName is the property you want to add
                        }
                        return item;
                    });

                    let oTemplatelogRes = {
                        total: iCount,
                        page: aRequestDetails.iOffset,
                        pageSize: aRequestDetails.iLimit,
                        aModuleDetails: oConsolidationLogListing
                    };
                    return await this._oCommonCls.FunDCT_Handleresponse('Success', 'CONSOLIDATE_TEMPLATE', 'CONSOLIDATE_TEMPLATE_LISTED', 200, oTemplatelogRes);
                }
            } else {
                let oTemplatelogListing = {
                    total: 0,
                    page: 0,
                    pageSize: aRequestDetails.iLimit,
                    aModuleDetails: []
                };
                return await this._oCommonCls.FunDCT_Handleresponse('Success', 'CONSOLIDATE_TEMPLATE', 'CONSOLIDATE_TEMPLATE_LISTED', 200, oTemplatelogListing);
            }

        } catch (err) {
            return await this._oCommonCls.FunDCT_Handleresponse('Error', 'APPLICATION', 'SERVER_ERROR', HttpStatusCodes.BAD_REQUEST, 'SERVER_ERROR');
        }
    }

    public listConsolidateRequestListingById = async (event) => {
        try {
            const { cSearchFilter, iTemplateID, cRequestType } = JSON.parse(event.body);
            const aRequestDetails = { cSearchFilter, iTemplateID, cRequestType };
            const cToken = event.headers?.['x-wwadct-token'] || event.headers?.['X-WWADCT-TOKEN'];
            await this._oCommonCls.FunDCT_SetCurrentUserDetails(cToken);
            this._oCommonCls.FunDCT_ApiRequest(event)
            let userID = this._oCommonCls.FunDCT_getUserID();
            let cSearchFilterQuery: any;
            if (aRequestDetails.cSearchFilter) {
                cSearchFilterQuery = {
                    $match: {
                        $or: [
                            { "iTemplateID": { "$regex": aRequestDetails.iTemplateID, "$options": "i" } },
                            { "IsConsolidationRequested.IsAlreadyRequested": true }
                        ],

                    }
                };
            } else {
                cSearchFilterQuery = { $match: {} };
            }

            let data: any = [];
            let iCount: number = await consolidationLogCount(cSearchFilterQuery, []);
            if (iCount > 0) {
                let oConsolidationLogListing: any = await TmplConsolidationReq.aggregate([
                    cSearchFilterQuery,
                    {
                        $lookup: {
                            from: "gen_statuses",
                            localField: "iStatusID",
                            foreignField: "_id",
                            as: "oTemplateConsolidationLogListing"
                        },
                    },
                    { $unwind: "$oTemplateConsolidationLogListing" },
                ]
                );
                oConsolidationLogListing.filter(record => {
                    let iEnteredby = record.IsConsolidationRequested.iEnteredby;
                    let iTemplateID = record.IsConsolidationRequested.iTemplateID;
                    let cRequestType = record.IsConsolidationRequested.cRequestType;
                    if (iEnteredby == userID && iTemplateID == aRequestDetails.iTemplateID && cRequestType == aRequestDetails.cRequestType) {
                        data = [record];
                    }
                });
                return data;

            } else {
                return await this._oCommonCls.FunDCT_Handleresponse('Success', 'CONSOLIDATE_TEMPLATE', 'CONSOLIDATE_TEMPLATE_LISTED', 200, data);
            }

        } catch (err) {
            return await this._oCommonCls.FunDCT_Handleresponse('Error', 'APPLICATION', 'SERVER_ERROR', HttpStatusCodes.BAD_REQUEST, 'SERVER_ERROR');
        }
    }

    public consolidateTemplate = async (event) => {
        try {        
            const { iTemplateID, cRequestType, IsAlreadyRequested } = JSON.parse(event.body);
            let oStatus;
            try {
                oStatus = await Status.findOne({ cStatusCode: 'ACTIVE' }).lean() as IStatus;
            } catch (error) {
                throw new Error(error.message);
            }
            let IsConsolidationRequested = {
                iEnteredby: event.requestContext.authorizer._id,
                iTemplateID,
                cRequestType,
                IsAlreadyRequested: IsAlreadyRequested,
            }

            const oTemplateDetails = await this._oCommonCls.FunDCT_GetTemplateDetails(iTemplateID);    
            const aRequestDetails = { iTemplateID, cTemplateName: oTemplateDetails[0].cTemplateName, bProcesslock: 'N', iStatusID: oStatus._id, iEnteredby: event.requestContext.authorizer._id, tEntered: new Date(), cRequestType, IsConsolidationRequested };
            let oTemplates = new TmplConsolidationReq(aRequestDetails);
            const tmplConsolidationDetail =  await oTemplates.save();
            await this.clsDCT_ManageTemplate.addUpdateDataIntoGenLaneAndGenLaneSchedule(oTemplateDetails[0].cTemplateType, event.requestContext.authorizer._id, tmplConsolidationDetail , "Consolidate")

            return await this._oCommonCls.FunDCT_Handleresponse('Success', 'CONSOLIDATE_TEMPLATE', 'CONSOLIDATE_REQUEST_SUBMITTED', 200, "oTemplates");
        } catch (err) {
            return await this._oCommonCls.FunDCT_Handleresponse('Error', 'APPLICATION', 'SERVER_ERROR', HttpStatusCodes.BAD_REQUEST, err.message);

        }
    }
}