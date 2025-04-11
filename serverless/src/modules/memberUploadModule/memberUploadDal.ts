import { ClsDCT_Common } from "../../commonModule/Class.common";
import MemTmplUploadLog from "../../models/MemTmplUploadLog";

const _oCommonCls = new ClsDCT_Common();

export const getMemberUploadLogCount = async (cSearchFilterQuery: any, cDateQuery: any, cTemplateTypes: any) => {
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
                    as: "oMemberUploadLogListing"
                }
            },
            { $unwind: "$oMemberUploadLogListing" },
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
                    'templateDetails.cTemplateType': { $in: cTemplateTypes }
                }
            },

            {
                $match: {
                    "templateDetails.iTempActiveStatus": 0
                }
            },
            ...cDateQuery,
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
        const countResult = await MemTmplUploadLog.aggregate(countAggregatePipeline);
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

export const getMemberUploadLog = async (aRequestDetails: any, oSort: any, cSearchFilterQuery: any, cDateQuery: any, iCount: number, templateTypeArray: any) => {
    let iLimitDynamic: number = 1;
    if (aRequestDetails.iLimit <= 0 && iCount > 0) {
        iLimitDynamic = iCount;
    } else {
        iLimitDynamic = aRequestDetails.iLimit;
    }
    const oDocuments = await MemTmplUploadLog.aggregate([
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
                as: "oMemberUploadLogListing"
            },
        },
        { $unwind: "$oMemberUploadLogListing" },
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
        ...cDateQuery,
        { $sort: oSort },
        { $skip: aRequestDetails.iOffsetLimit },
        { $limit: iLimitDynamic },
        {
            $project: {
                _id: 1,
                aTemplateFileName: 1,
                aTemplateFileSize: 1,
                bExceptionfound: 1,
                bProcessed: 1,
                bProcesslock: 1,
                cAddtionalComment: 1,
                cAddtionalFile: 1,
                cExceptionDetails: 1,
                cScacCode: 1,
                cTemplateFile: 1,
                cTemplateName: 1,
                cTemplateStatusFile: 1,
                // cUploadStatus:1,
                cUploadType: 1,
                errorFilePath: 1,
                iEnteredby: 1,
                iMemberID: 1,
                iStatusID: 1,
                iTemplateID: 1,
                iUpdatedby: 1,
                oMemberUploadLogListing: 1,
                successFilePath: 1,
                tEntered: 1,
                tProcessEnd: 1,
                tProcessStart: 1,
                tUpdated: 1,
                // cTemplateStatusUploadedFile:1,
                cUploadedFile: 1,
            }
        }
    ]);
    return oDocuments;
}