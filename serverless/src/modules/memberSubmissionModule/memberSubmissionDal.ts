import { ClsDCT_Common } from "../../commonModule/Class.common";
import MemberSubmissionDownloadLog from "../../models/MemberSubmissionDownloadLog";

let _oCommonCls = new ClsDCT_Common();

export const memberSubmissionLogListingCount = async (cSearchFilterQuery: any, cTemplateTypes: string[]) => {
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
                    from: "gen_templates",
                    localField: "iTemplateID",
                    foreignField: "_id",
                    as: "templateDetails"
                }
            },
            { $unwind: "$templateDetails" },
            {
                $match: {
                    "templateDetails.cTemplateType": { $in: cTemplateTypes }
                }
            },
            {
                $match: {
                    "templateDetails.iTempActiveStatus": 0
                }
            }
        ];


        // if (cTemplateTypes && cTemplateTypes.length > 0) {
        //   countAggregatePipeline.push({
        //     $match: {
        //       "templateDetails.cTemplateType": { $in: cTemplateTypes }
        //     }
        //   });
        // }

        countAggregatePipeline.push({
            $group: {
                _id: null,
                count: { $sum: 1 }
            }
        });

        const countResult = await MemberSubmissionDownloadLog.aggregate(countAggregatePipeline);
        if (countResult.length > 0) {
            return countResult[0].count;
        } else {
            return 0; // No matching records found
        }
    } catch (err) {
        _oCommonCls.log(err);
    }
}


export const memberSubmissionLog = async (aRequestDetails: any, oSort: any, cSearchFilterQuery: any, iCount: number, cTemplateTypes: any) => {
    let iLimitDynamic: number = 1;
    if (aRequestDetails.iLimit <= 0 && iCount > 0) {
        iLimitDynamic = iCount;
    } else {
        iLimitDynamic = aRequestDetails.iLimit;
    }

    const oDocuments = await MemberSubmissionDownloadLog.aggregate([
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
                "templateDetails.cTemplateType": { $in: cTemplateTypes }
            }
        },
        {
            $match: {
                "templateDetails.iTempActiveStatus": 0
            }
        },
        { $sort: oSort },
        { $skip: aRequestDetails.iOffsetLimit },
        { $limit: iLimitDynamic }
    ]);

    return oDocuments;
}