import { ClsDCT_Common } from "../../commonModule/Class.common";
import HttpStatusCodes from "http-status-codes";
import { getValidationRule, getValidationRuleCount } from "./validateRuleDal";
import Status, { IStatus } from "../../models/GenStatus";
import TemplateValidation, { ITemplateValidation } from "../../models/GenTemplateValidation";


export class ValidateRuleService {
    private _oCommonCls = new ClsDCT_Common();

    public validationRuleListing = async (event) => {
        try {
            const body = JSON.parse(event.body);
            const { iOffset, iLimit, iOffsetLimit, cSearchFilter, cSort, cSortOrder } = body;
            const aRequestDetails = { iOffset, iLimit, iOffsetLimit, cSearchFilter, cSort, cSortOrder };

            let cSearchFilterQuery: any;
            if (aRequestDetails.cSearchFilter) {
                cSearchFilterQuery = { $match: { $or: [{ "cValidateRule": { "$regex": aRequestDetails.cSearchFilter, "$options": "i" } }, { "cValidateDescription": { "$regex": aRequestDetails.cSearchFilter, "$options": "i" } }] } };
            } else {
                cSearchFilterQuery = { $match: {} };
            }

            let oSort = {};
            if (aRequestDetails.cSort) {
                oSort[aRequestDetails.cSort] = aRequestDetails.cSortOrder;
            } else {
                oSort['_id'] = -1;
            }

            let iCount: number = await getValidationRuleCount(cSearchFilterQuery);
            if (iCount > 0) {
                let oValidationRuleListing: any = await getValidationRule(aRequestDetails, oSort, cSearchFilterQuery, iCount);
                if (oValidationRuleListing) {
                    let oMessageRes = {
                        total: iCount,
                        page: aRequestDetails.iOffset,
                        pageSize: aRequestDetails.iLimit,
                        aModuleDetails: oValidationRuleListing
                    };
                    return await this._oCommonCls.FunDCT_Handleresponse('Success', 'VALIDATION_RULE', 'VALIDATIONRULE_LISTED', 200, oMessageRes);
                }
            } else {
                let oMessageRes = {
                    total: 0,
                    page: 0,
                    pageSize: aRequestDetails.iLimit,
                    aModuleDetails: []
                };
                return await this._oCommonCls.FunDCT_Handleresponse('Success', 'VALIDATION_RULE', 'VALIDATIONRULE_LISTED', 200, oMessageRes);
            }

        } catch (err) {
            return await this._oCommonCls.FunDCT_Handleresponse('Error', 'APPLICATION', 'SERVER_ERROR', HttpStatusCodes.BAD_REQUEST, err);
        }

    }

    public validationRulesAdd = async (event) => {
        try {
            const body = JSON.parse(event.body);
            const { cValidateRule, cValidateRegex, cValidateDescription, cConditionalType, cConditionalState, cTemplateType } = body;

            let oStatus;
            try {
                oStatus = await Status.findOne({ cStatusCode: 'ACTIVE' }).lean() as IStatus;
            } catch (error) {
                throw new Error(error.message);
            }

            const aRequestDetails = { cValidateRule, cValidateRegex, cValidateDescription, cConditionalType, cConditionalState, iStatusID: oStatus._id, iEnteredby: event.requestContext.authorizer._id, tEntered: new Date(), cTemplateType: JSON.parse(cTemplateType) };//cTemplateType: JSON.parse(cTemplateType)  added by spirgonde for Multiselect dropdown of template type on manage validation screen
            let oValidationRule = await TemplateValidation.findOne({ cValidateRule: cValidateRule, cValidateRegex: cValidateRegex }).lean() as ITemplateValidation;
            if (oValidationRule) {
                oValidationRule = await TemplateValidation.findOneAndUpdate(
                    { cValidateRule: cValidateRule },
                    { $set: aRequestDetails },
                    { new: true }
                ).lean() as ITemplateValidation;
                return await this._oCommonCls.FunDCT_Handleresponse('Success', 'VALIDATION_RULE', 'VALIDATIONRULE_UPDATED', 200, oValidationRule);
            } else {
                oValidationRule = new TemplateValidation(aRequestDetails);
                await oValidationRule.save();
                return await this._oCommonCls.FunDCT_Handleresponse('Success', 'VALIDATION_RULE', 'VALIDATIONRULE_INSERTED', 200, oValidationRule);
            }
        } catch (err) {
            return await this._oCommonCls.FunDCT_Handleresponse('Error', 'APPLICATION', 'SERVER_ERROR', HttpStatusCodes.BAD_REQUEST, err);
        }
    }

    public validationRulesUpdate = async (event) => {
        try {

            const body = JSON.parse(event.body);
            const { cValidateRule, cValidateDescription, cConditionalType, cConditionalState, cValidateRegex, iStatusID, cTemplateType } = body;//cTemplateType added by spirgonde for Multiselect dropdown of template type on manage validation screen
            const aValidationRuleFields = {
                cValidateRule,
                cValidateDescription,
                cConditionalType,
                cConditionalState,
                cValidateRegex,
                iStatusID: iStatusID,
                iUpdatedby: event.requestContext.authorizer._id,
                tUpdated: new Date(),
                cTemplateType: JSON.parse(cTemplateType)//JSON.parse(cTemplateType) added by spirgonde for Multiselect dropdown of template type on manage validation screen
            };

            let oValidationRule  = await TemplateValidation.findOne({ _id: event.pathParameters.id }).lean() as ITemplateValidation;

            if (oValidationRule) {
                oValidationRule = await TemplateValidation.findOneAndUpdate(
                    { _id: event.pathParameters.id },
                    { $set: aValidationRuleFields },
                    { new: true }
                ).lean() as ITemplateValidation;
                return await this._oCommonCls.FunDCT_Handleresponse('Success', 'VALIDATION_RULE', 'VALIDATIONRULE_UPDATED', 200, oValidationRule);

            } else {
                return await this._oCommonCls.FunDCT_Handleresponse('Error', 'APPLICATION', 'SERVER_ERROR', HttpStatusCodes.BAD_REQUEST, 'Error : VALIDATIONRULE_UPDATED');
            }
        } catch (err) {
            return await this._oCommonCls.FunDCT_Handleresponse('Error', 'APPLICATION', 'SERVER_ERROR', HttpStatusCodes.BAD_REQUEST, 'Error : VALIDATIONRULE_UPDATED');
        }
    }

    public validationRuleDelete = async(event)=> {
        let oValidationRule = await TemplateValidation.findOne({ _id: event.pathParameters.id }).lean() as ITemplateValidation;
        if (oValidationRule) {
          await TemplateValidation.deleteOne({ _id: event.pathParameters.id }).then(result => {
            return true;
          });
          return await this._oCommonCls.FunDCT_Handleresponse('Success', 'VALIDATION_RULE', 'VALIDATIONRULE_DELETED', 200, event.pathParameters.id);
        } else {
            return await this._oCommonCls.FunDCT_Handleresponse('Error', 'APPLICATION', 'SERVER_ERROR', HttpStatusCodes.BAD_REQUEST, 'Error : VALIDATIONRULE_DELETED');
        }
      }

}