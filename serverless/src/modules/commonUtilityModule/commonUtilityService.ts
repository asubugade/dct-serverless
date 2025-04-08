import { ClsDCT_Common } from "../../commonModule/Class.common";
import HttpStatusCodes from "http-status-codes";


export class CommonUtilityService {
    private _oCommonCls = new ClsDCT_Common();

    public listExport = async (event) => {
        try {
            const body = JSON.parse(event.body)
            const { cType, cSort, cSortOrder, cTemplateTypes } = body;
            this._oCommonCls.FunDCT_ApiRequest(event)
            const cToken = event.headers?.['x-wwadct-token'] || event.headers?.['X-WWADCT-TOKEN'];
            this._oCommonCls.FunDCT_SetCurrentUserDetails(cToken);
            this._oCommonCls.FunDCT_SetType(cType);
            let cSearchFilterQuery: any;
            let oSort = {};
            if (cSort) {
                oSort[cSort] = cSortOrder === 'asc' || cSortOrder === 1 ? 1 : -1;
            } else {
                oSort['_id'] = -1;  // Default sort by _id in descending order
            }
            if (body.cSearchFilter) {
                if (cType == 'TEMPLATE_UPLOAD_LOG') {
                    cSearchFilterQuery = {
                        $match: {
                            $or: [{ "iTemplateID": { "$regex": body.cSearchFilter, "$options": "i" } }, { "cTemplateName": { "$regex": body.cSearchFilter, "$options": "i" } }]
                        }
                    };
                }
                else if (cType == 'LIST_TEMPLATE') {
                    cSearchFilterQuery = {
                        $match: {
                            $or: [{ "cTemplateName": { "$regex": body.cSearchFilter, "$options": "i" } }]
                        }
                    };
                }
                else if (cType == 'MEMBER_TEMPLATE_LIST') {
                    cSearchFilterQuery = {
                        $match: {
                            $or: [{ "cTemplateName": { "$regex": body.cSearchFilter, "$options": "i" } }]
                        }
                    };
                }
                else if (cType == 'ACCESS_TYPE') {
                    cSearchFilterQuery = {
                        $match: {
                            $or: [{ "cAccessCode": { "$regex": body.cSearchFilter, "$options": "i" } }, { "cAccessName": { "$regex": body.cSearchFilter, "$options": "i" } }]
                        }
                    };
                }
                else if (cType == 'ADDITIONAL_FIELDS') {
                    cSearchFilterQuery = {
                        $match: {
                            $or: [{ "cAdditionalFieldText": { "$regex": body.cSearchFilter, "$options": "i" } }, { "cAdditionalFieldValue": { "$regex": body.cSearchFilter, "$options": "i" } }]
                            // $and: [{ "cAdditionalFieldText": { "$nin": oSelectedAdditionalFields } }]
                        }
                    };
                }
                else if (cType == 'CONSOLIDATE') {
                    cSearchFilterQuery = {
                        $match: {
                            $or: [{ "iTemplateID": { "$regex": body.cSearchFilter, "$options": "i" } }, { "cTemplateName": { "$regex": body.cSearchFilter, "$options": "i" } }]
                        }
                    };
                }
                else if (cType == 'CUSTOMER') {
                    cSearchFilterQuery = {
                        $match: {
                            $or: [{ "cAliascode": { "$regex": body.cSearchFilter, "$options": "i" } }, { "cAliasname": { "$regex": body.cSearchFilter, "$options": "i" } }]
                        }
                    };
                }
                else if (cType == 'MEMBER_RESTRICTION') {
                    cSearchFilterQuery = {
                        $match: {
                            $or: [{ "cType": { "$regex": body.cSearchFilter, "$options": "i" } }, { "cTemplateType": { "$regex": body.cSearchFilter, "$options": "i" } }]
                        }
                    };
                }
                else if (cType == 'MEMBER') {
                    cSearchFilterQuery = {
                        $match: {
                            $or: [{ "cScac": { "$regex": body.cSearchFilter, "$options": "i" } }, { "cName": { "$regex": body.cSearchFilter, "$options": "i" } }]
                        }
                    };
                }
                else if (cType == 'MEMBER_SUBMISSION_TEMPLATE_LOGS') {
                    cSearchFilterQuery = {
                        $match: {
                            $or: [{ "iTemplateID": { "$regex": body.cSearchFilter, "$options": "i" } }, { "cTemplateName": { "$regex": body.cSearchFilter, "$options": "i" } }]
                        }
                    };
                }
                else if (cType == 'CHARGECODE') {
                    cSearchFilterQuery = {
                        $match: {
                            $or: [{ "cCode": { "$regex": body.cSearchFilter, "$options": "i" } }, { "cName": { "$regex": body.cSearchFilter, "$options": "i" } }]
                        }
                    };
                }
                else if (cType == 'COUNTRY') {
                    cSearchFilterQuery = {
                        $match: {
                            $or: [{ "cCode": { "$regex": body.cSearchFilter, "$options": "i" } }, { "cName": { "$regex": body.cSearchFilter, "$options": "i" } }]
                        }
                    };
                }
                else if (cType == 'CURRENCY') {
                    cSearchFilterQuery = {
                        $match: {
                            $or: [{ "cCode": { "$regex": body.cSearchFilter, "$options": "i" } }, { "cName": { "$regex": body.cSearchFilter, "$options": "i" } }]
                        }
                    };
                }
                else if (cType == 'EMAIL_TEMPLATES') {
                    cSearchFilterQuery = {
                        $match: {
                            $or: [{ "iProcessID": { "$regex": body.cSearchFilter, "$options": "i" } }, { "cSubject": { "$regex": body.cSearchFilter, "$options": "i" } }]
                        }
                    };
                }
                else if (cType == 'LOCATIONS') {
                    cSearchFilterQuery = {
                        $match: {
                            $or: [{ "cCode": { "$regex": body.cSearchFilter, "$options": "i" } }, { "cCountryCode": { "$regex": body.cSearchFilter, "$options": "i" } }]
                        }
                    };
                }
                else if (cType == 'MESSAGE') {
                    cSearchFilterQuery = {
                        $match: {
                            $or: [{ "cModuleCode": { "$regex": body.cSearchFilter, "$options": "i" } }, { "cMessageCode": { "$regex": body.cSearchFilter, "$options": "i" } }]
                        }
                    };
                }
                else if (cType == 'PERMISSION') {
                    cSearchFilterQuery = {
                        $match: {
                            $or: [{ "oProcessListing.cProcessCode": { "$regex": body.cSearchFilter, "$options": "i" } }, { "oAccessTypeListing.cAccessCode": { "$regex": body.cSearchFilter, "$options": "i" } }]
                        }
                    };
                }
                else if (cType == 'PROCESS') {
                    cSearchFilterQuery = {
                        $match: {
                            $or: [{ "cProcessCode": { "$regex": body.cSearchFilter, "$options": "i" } }, { "cProcessName": { "$regex": body.cSearchFilter, "$options": "i" } }]
                        }
                    };
                }
                else if (cType == 'RATE_BASIS') {
                    cSearchFilterQuery = {
                        $match: {
                            $or: [{ "cCode": { "$regex": body.cSearchFilter, "$options": "i" } }, { "cName": { "$regex": body.cSearchFilter, "$options": "i" } }]
                        }
                    };
                }
                else if (cType == 'REGION') {
                    cSearchFilterQuery = {
                        $match: {
                            $or: [{ "cCode": { "$regex": body.cSearchFilter, "$options": "i" } }, { "cName": { "$regex": body.cSearchFilter, "$options": "i" } }]
                        }
                    };
                }
                else if (cType == 'EMAIL_FREQUENCY') {
                    cSearchFilterQuery = {
                        $match: {
                            $or: [{ "cFrom": { "$regex": body.cSearchFilter, "$options": "i" } }, { "cProcessName": { "$regex": body.cSearchFilter, "$options": "i" } }]
                        }
                    };
                }
                else if (cType == 'STATUS') {
                    cSearchFilterQuery = {
                        $match: {
                            $or: [{ "cStatusCode": { "$regex": body.cSearchFilter, "$options": "i" } }, { "cStatusName": { "$regex": body.cSearchFilter, "$options": "i" } }]
                        }
                    };
                }
                else if (cType == 'TEMPLATE_TYPE') {
                    cSearchFilterQuery = {
                        $match: {
                            $or: [{ "cTemplateType": { "$regex": body.cSearchFilter, "$options": "i" } }]
                        }
                    };
                }
                else if (cType == 'CARRIER') {
                    cSearchFilterQuery = {
                        $match: {
                            $or: [{ "cCarrierName": { "$regex": body.cSearchFilter, "$options": "i" } }, { "cCarrierScac": { "$regex": body.cSearchFilter, "$options": "i" } }]
                        }
                    };
                }
                else if (cType == 'USER') {
                    cSearchFilterQuery = {
                        $match: {
                            $or: [{ "oAccessTypeListing.cAccessCode": { "$regex": body.cSearchFilter, "$options": "i" } }, { "cEmail": { "$regex": body.cSearchFilter, "$options": "i" } }, { "cUsername": { "$regex": body.cSearchFilter, "$options": "i" } }]
                        }
                    };
                }
                else if (cType == 'VALIDATION_RULE') {
                    cSearchFilterQuery = {
                        $match: {
                            $or: [{ "cValidateRule": { "$regex": body.cSearchFilter, "$options": "i" } }, { "cValidateDescription": { "$regex": body.cSearchFilter, "$options": "i" } }]
                        }
                    };
                }
                else if (cType == 'MEMBER_UPLOAD_LOG') {
                    cSearchFilterQuery = {
                        $match: {
                            $or: [{ "cScacCode": { "$regex": body.cSearchFilter, "$options": "i" } }, { "cTemplateName": { "$regex": body.cSearchFilter, "$options": "i" } }]
                            // $and: [cMemberCond] 
                        }
                    };
                }
                else {
                    cSearchFilterQuery = {
                        $match: {}
                    };
                }
            } else {
                cSearchFilterQuery = {
                    $match: {}
                };
                let typeArray = ['LIST_TEMPLATE', 'MEMBER_TEMPLATE_LIST']
                if (typeArray.includes(cType)) {
                    cSearchFilterQuery = {
                        $match: {
                            iTempActiveStatus: 0
                        }
                    };
                }
            }
            let objRes = await this._oCommonCls.FunDCT_exportDetails(JSON.stringify(cSearchFilterQuery), oSort, event, cTemplateTypes ? cTemplateTypes : []);
            console.log("objRes================>",objRes);
            
            if (objRes.cStatus == 'Success') {
                let oJSONRes = {
                    aModuleDetails: objRes
                };
                // return oRes.send(objRes)
            } else {
                let oJSONRes = {
                    aModuleDetails: objRes
                };
                return await this._oCommonCls.FunDCT_Handleresponse('Success', 'CREATE_TEMPLATE', 'EXCELTOJSON_UNSUCESS', 200, oJSONRes);
            }
        } catch (err) {
            return await this._oCommonCls.FunDCT_Handleresponse('Error', 'APPLICATION', 'SERVER_ERROR', HttpStatusCodes.BAD_REQUEST, err);
        }
    }

}