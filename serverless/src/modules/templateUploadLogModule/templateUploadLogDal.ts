import { ClsDCT_Common } from "../../commonModule/Class.common";
import TmplUploadLog, { ITmplUploadLog } from "../../models/Tmpluploadlog";


const _oCommonCls = new ClsDCT_Common();


export const getTemplateUploadLogCount = async (cSearchFilterQuery: any, cTemplateTypes: string[]) => {
    try {
        const countAggregatePipeline = [
            cSearchFilterQuery,
            {
                $match: {
                    iActiveStatus: 0
                }
            },
            {
                $lookup: {
                    from: "gen_statuses",
                    localField: "iStatusID",
                    foreignField: "_id",
                    as: "oTemplateUploadLogListing"
                }
            },
            { $unwind: "$oTemplateUploadLogListing" },
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
        const countResult = await TmplUploadLog.aggregate(countAggregatePipeline);
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

export const getMemberUploadLog = async (aRequestDetails: any, oSort: any, cSearchFilterQuery: any, iCount: number, templateTypeArray: any) => {
    let iLimitDynamic: number = 1;
    if (aRequestDetails.iLimit <= 0 && iCount > 0) {
        iLimitDynamic = iCount;
    } else {
        iLimitDynamic = aRequestDetails.iLimit;
    }

    const oDocuments = await TmplUploadLog.aggregate([
        cSearchFilterQuery,
        {
            $match: {
                iActiveStatus: 0
            }
        },
        {
            $lookup: {
                from: "gen_statuses",
                localField: "iStatusID",
                foreignField: "_id",
                as: "oTemplateUploadLogListing"
            },
        },
        { $unwind: "$oTemplateUploadLogListing" },
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
                'templateDetails.cTemplateType': { $in: templateTypeArray }
            }
        },
        {
            $match: {
                "templateDetails.iTempActiveStatus": 0
            }
        },

        { $sort: oSort },
        { $skip: aRequestDetails.iOffsetLimit },
        { $limit: iLimitDynamic }, //aRequestDetails.iLimit
        {
            $project: {
                _id: 1,
                aTemplateFileName: 1,
                aTemplateFileSize: 1,
                bExceptionfound: 1,
                bProcessed: 1,
                bProcesslock: 1,
                cAddtionalFile: 1,
                cExceptionDetails: { $ifNull: ["$cExceptionDetails", {}] },
                cDistributionDetails: 1,
                cSelectedMembers: 1,
                cTemplateFile: 1,
                cTemplateName: 1,
                cTemplateStatusFile: 1,
                cUploadedFile: 1,
                iEnteredby: 1,
                iStatusID: 1,
                iTemplateID: 1,
                iUpdatedby: 1,
                oTemplateUploadLogListing: 1,
                tEntered: 1,
                tProcessEnd: 1,
                tProcessStart: 1,
                tUpdated: 1
            }
        }
    ]);

    return oDocuments;
}