import { ClsDCT_Common } from "../../commonModule/Class.common";
import TemplateValidation, { ITemplateValidation } from "../../models/GenTemplateValidation";



const _oCommonCls = new ClsDCT_Common();

export const getValidationRuleCount = async (cSearchFilterQuery: any) => {
    try {
        const countAggregatePipeline = [
            cSearchFilterQuery,
            {
                $lookup: {
                    from: "gen_statuses",
                    localField: "iStatusID",
                    foreignField: "_id",
                    as: "oValidationRuleListing"
                }
            },
            { $unwind: "$oValidationRuleListing" },
            {
                $lookup: {
                    from: "gen_users",
                    localField: "iEnteredby",
                    foreignField: "_id",
                    as: "oUserListing"
                }
            },
            { $unwind: "$oUserListing" },
            {
                $group: {
                    _id: null,
                    count: { $sum: 1 }
                }
            }
        ];
        const countResult = await TemplateValidation.aggregate(countAggregatePipeline);
        if (countResult.length > 0) {
            return countResult[0].count;
        } else {
            return 0; // No matching records found
        }
    }
    catch (err) {
        _oCommonCls.log(err)
    }
}


export const getValidationRule = async (aRequestDetails: any, oSort: any, cSearchFilterQuery: any, iCount: number) => {
    let iLimitDynamic: number = 1;
    if (aRequestDetails.iLimit <= 0 && iCount > 0) {
        iLimitDynamic = iCount;
    } else {
        iLimitDynamic = aRequestDetails.iLimit;
    }
    const oDocuments = await TemplateValidation.aggregate([
        cSearchFilterQuery,
        {
            $lookup: {
                from: "gen_statuses",
                localField: "iStatusID",
                foreignField: "_id",
                as: "oValidationRuleListing"
            }
        },
        { $unwind: "$oValidationRuleListing" },
        //code added by spirgonde for changing entered by  and Updated By from Id to user name start ...

        {
            $lookup: {
                from: "gen_users",
                localField: "iEnteredby",
                foreignField: "_id",
                as: "oUserListing"
            }
        },

        { $unwind: "$oUserListing" },

        {
            $lookup: {
                from: "gen_users",
                localField: "iUpdatedby",
                foreignField: "_id",
                as: "oUpdatedby"
            }
        },

        {
            $lookup: {
                from: "gen_template_types",
                localField: "cTemplateType",
                foreignField: "_id",
                as: "oTemplateTypesListing"
            }
        },
        { $unwind: "$oValidationRuleListing" },

        /* In below block of code $unwind is modified by adding "path" and "preserveNullAndEmptyArrays": true ,so that if "iUpdatedby" 
           is not found in collection then preiviously aggregated collection can be returned  */
        {
            "$unwind": {
                "path": "$oUpdatedby",
                "preserveNullAndEmptyArrays": true
            }
        },

        //code added by spirgonde for changing entered by  and Updated By from Id to user name  end .   
        { $sort: oSort },
        { $skip: aRequestDetails.iOffsetLimit },
        { $limit: iLimitDynamic },
        {
            $project: {
                _id: 1,
                cTemplateType: 1,
                cValidateRule: 1,
                cValidateRegex: 1,
                cValidateDescription: 1,
                cConditionalType: 1,
                cConditionalState: 1,
                iStatusID: 1,
                iEnteredby: 1,
                tEntered: 1,
                tUpdated: 1,
                oValidationRuleListing: 1,

                "oTemplateTypesListing.cTemplateType": 1,

                "oUserListing._id": 1,
                "oUserListing.cName": 1,
                "oUserListing.cUsername": 1,

                "oUpdatedby._id": 1,
                "oUpdatedby.cName": 1,
                "oUpdatedby.cUsername": 1,
            },
        }
    ]);

    return oDocuments;
}