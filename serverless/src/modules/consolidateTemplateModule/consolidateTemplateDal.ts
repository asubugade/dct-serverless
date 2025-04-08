import { ClsDCT_Common } from "../../commonModule/Class.common";
import TmplConsolidationReq, { ITmplConsolidationReq } from "../../models/TmplConsolidationReq";



let _oCommonCls = new ClsDCT_Common();

export const consolidationLogCount = async (cSearchFilterQuery: any, cTemplateTypes: string[]) => {
    try {
        const countAggregatePipeline = [
            cSearchFilterQuery,
            {
                $lookup: {
                    from: "gen_statuses",
                    localField: "iStatusID",
                    foreignField: "_id",
                    as: "oConsolidationLogListing"
                }
            },
            { $unwind: "$oConsolidationLogListing" },
            {
                $lookup: {
                    from: "gen_templates", // assuming the collection name is 'templates'
                    localField: "iTemplateID",
                    foreignField: "_id",
                    as: "templateDetails"
                }
            },
            { $unwind: "$templateDetails" },
            {
                $match: {
                    "templateDetails.iTempActiveStatus": 0
                }
            }
        ];

        if (cTemplateTypes && cTemplateTypes.length > 0) {
            countAggregatePipeline.push({
                $match: {
                    "templateDetails.cTemplateType": { $in: cTemplateTypes }
                }
            });
        }

        countAggregatePipeline.push({
            $group: {
                _id: null,
                count: { $sum: 1 }
            }
        });
        const countResult = await TmplConsolidationReq.aggregate(countAggregatePipeline);
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

export const consolidationLog = async (aRequestDetails: any, oSort: any, cSearchFilterQuery: any, iCount: number, templateTypeArray: any) => {
    let iLimitDynamic: number = 1;
    if (aRequestDetails.iLimit <= 0 && iCount > 0) {
        iLimitDynamic = iCount;
    } else {
        iLimitDynamic = aRequestDetails.iLimit;
    }

    const oDocuments = await TmplConsolidationReq.aggregate([
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
        {
            $lookup: {
                from: "gen_templates",
                localField: "iTemplateID",
                foreignField: "_id",
                as: "templateDetails"
            }
        },
        { $unwind: "$templateDetails" },
        {
            $match: {
                "templateDetails.iTempActiveStatus": 0
            }
        },
        {
            $match: {
                'templateDetails.cTemplateType': { $in: templateTypeArray }
            }
        },
        { $sort: oSort },
        { $skip: aRequestDetails.iOffsetLimit },
        { $limit: iLimitDynamic }, //aRequestDetails.iLimit
    ]
    );

    return oDocuments;
}