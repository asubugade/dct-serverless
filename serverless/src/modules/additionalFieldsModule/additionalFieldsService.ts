import { ClsDCT_Common } from "../../commonModule/Class.common";
import AdditionalFields, { IAdditionalFields } from "../../models/Additionalfields";
import Status, { IStatus } from "../../models/GenStatus";
import { getAdditionalFields, getAdditionalFieldsCount } from "./additionalFieldsDal";
import HttpStatusCodes from "http-status-codes";


export class AdditionalFieldsService {
    private _oCommonCls = new ClsDCT_Common();

    public additionalFieldsListing = async (event) => {
        try {
            const body = JSON.parse(event.body);

            const { iOffset, iLimit, iOffsetLimit, cSearchFilter, cSort, cSortOrder, cSelectedValues } = body;
            const aRequestDetails = { iOffset, iLimit, iOffsetLimit, cSearchFilter, cSort, cSortOrder, cSelectedValues };

            let cSelectedFieldsQuery: any;
            let oSelectedAdditionalFields = [];
            if (typeof cSelectedValues !== 'undefined') {
                if (cSelectedValues.length > 0) {
                    if (typeof cSelectedValues[0]['cAdditionalFields'] !== 'undefined' && cSelectedValues[0]['cAdditionalFields'].length > 0) {
                        oSelectedAdditionalFields = await AdditionalFields.find({ _id: { $in: cSelectedValues[0]['cAdditionalFields'] }, cSelectionType: 'Single' }).select('cAdditionalFieldText').distinct('cAdditionalFieldText', function (error, oResAdditionalFieldText) {
                        });
                        if (oSelectedAdditionalFields) {
                            cSelectedFieldsQuery = oSelectedAdditionalFields;
                        }
                    }
                }
            }

            let cSearchFilterQuery: any;
            if (aRequestDetails.cSearchFilter) {
                cSearchFilterQuery = {
                    $match: {
                        $or: [{ "cAdditionalFieldText": { "$regex": aRequestDetails.cSearchFilter, "$options": "i" } }, { "cAdditionalFieldValue": { "$regex": aRequestDetails.cSearchFilter, "$options": "i" } }],
                        $and: [{ "cAdditionalFieldText": { "$nin": oSelectedAdditionalFields } }]
                    }
                };
            } else {
                cSearchFilterQuery = { $match: {} };
            }

            let oSort = {};
            if (aRequestDetails.cSort) {
                oSort[aRequestDetails.cSort] = aRequestDetails.cSortOrder;
            } else {
                oSort['_id'] = -1;
            }

            let iCount: number = await getAdditionalFieldsCount(cSearchFilterQuery);
            if (iCount > 0) {
                let oAdditionalFieldListing: any = await getAdditionalFields(aRequestDetails, oSort, cSearchFilterQuery, iCount);
                if (oAdditionalFieldListing) {
                    let oMessageRes = {
                        total: iCount,
                        page: aRequestDetails.iOffset,
                        pageSize: aRequestDetails.iLimit,
                        aModuleDetails: oAdditionalFieldListing
                    };
                    return await this._oCommonCls.FunDCT_Handleresponse('Success', 'ADDITIONAL_FIELDS', 'ADDITIONAL_FIELDS_LISTED', 200, oMessageRes);
                }
            } else {
                let oMessageRes = {
                    total: 0,
                    page: 0,
                    pageSize: aRequestDetails.iLimit,
                    aModuleDetails: []
                };
                return await this._oCommonCls.FunDCT_Handleresponse('Success', 'ADDITIONAL_FIELDS', 'ADDITIONAL_FIELDS_LISTED', 200, oMessageRes);
            }

        } catch (err) {
            return await this._oCommonCls.FunDCT_Handleresponse('Error', 'APPLICATION', 'SERVER_ERROR', HttpStatusCodes.BAD_REQUEST, err);
        }

    }

    public additionalFieldsAdd = async (event) => {
        try {

            const body = JSON.parse(event.body);

            const { cAdditionalFieldText, cAdditionalFieldValue, cSelectionType } = body;

            let oStatus;
            try {
                oStatus = await Status.findOne({ cStatusCode: 'ACTIVE' }).lean() as IStatus;
            } catch (error) {
                throw new error
            }

            const aRequestDetails = { cAdditionalFieldText, cAdditionalFieldValue, cSelectionType, iStatusID: oStatus._id, iEnteredby: event.requestContext.authorizer._id, tEntered: new Date() };
            let oValidationRule = await AdditionalFields.findOne({ cAdditionalFieldText: cAdditionalFieldText, cAdditionalFieldValue: cAdditionalFieldValue }).lean() as IAdditionalFields;

            if (oValidationRule) {
                oValidationRule = await AdditionalFields.findOneAndUpdate(
                    { cAdditionalFieldText: cAdditionalFieldText },
                    { $set: aRequestDetails },
                    { new: true }
                ).lean() as IAdditionalFields;
                return await this._oCommonCls.FunDCT_Handleresponse('Success', 'ADDITIONAL_FIELDS', 'ADDITIONAL_FIELDS_UPDATED', 200, oValidationRule);
            } else {
                oValidationRule = new AdditionalFields(aRequestDetails);
                await oValidationRule.save();
                return await this._oCommonCls.FunDCT_Handleresponse('Success', 'ADDITIONAL_FIELDS', 'ADDITIONAL_FIELDS_INSERTED', 200, oValidationRule);
            }
        } catch (err) {
            return await this._oCommonCls.FunDCT_Handleresponse('Error', 'APPLICATION', 'SERVER_ERROR', HttpStatusCodes.BAD_REQUEST, err);
        }
    }

    public additionalFieldsUpdate = async (event) => {
        try {
            const body = JSON.parse(event.body);
            const { cAdditionalFieldText, cAdditionalFieldValue, cSelectionType, iStatusID } = body;
            const aValidationRuleFields = {
                cAdditionalFieldText,
                cAdditionalFieldValue,
                cSelectionType,
                iStatusID: iStatusID,
                iUpdatedby: event.requestContext.authorizer._id,
                tUpdated: new Date()
            };

            let oValidationRule = await AdditionalFields.findOne({ _id: event.pathParameters.id }).lean() as IAdditionalFields;

            if (oValidationRule) {
                oValidationRule = await AdditionalFields.findOneAndUpdate(
                    { _id: event.pathParameters.id },
                    { $set: aValidationRuleFields },
                    { new: true }
                ).lean() as IAdditionalFields;
                return await this._oCommonCls.FunDCT_Handleresponse('Success', 'ADDITIONAL_FIELDS', 'ADDITIONAL_FIELDS_UPDATED', 200, oValidationRule);

            } else {
                return await this._oCommonCls.FunDCT_Handleresponse('Error', 'APPLICATION', 'SERVER_ERROR', HttpStatusCodes.BAD_REQUEST, 'Error : ADDITIONAL_FIELDS_UPDATED');
            }
        } catch (err) {
            return await this._oCommonCls.FunDCT_Handleresponse('Error', 'APPLICATION', 'SERVER_ERROR', HttpStatusCodes.BAD_REQUEST, err);
        }
    }

    public additionalFieldsDelete = async (event) => {
        let oValidationRule = await AdditionalFields.findOne({ _id: event.pathParameters.id }).lean() as IAdditionalFields;
        if (oValidationRule) {
            await AdditionalFields.deleteOne({ _id: event.pathParameters.id }).then(result => {
                return true;
            });
            return await this._oCommonCls.FunDCT_Handleresponse('Success', 'ADDITIONAL_FIELDS', 'ADDITIONAL_FIELDS_DELETED', 200, event.pathParameters.id);
        } else {
            return await this._oCommonCls.FunDCT_Handleresponse('Error', 'APPLICATION', 'SERVER_ERROR', HttpStatusCodes.BAD_REQUEST, 'Error : ADDITIONAL_FIELDS_DELETED');
        }
    }


}