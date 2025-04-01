import oConnectDB from "../../config/database";
import GenTemplateType, { ITemplateType } from "../../models/GenTemplateType"
import TemplateType from "../../models/GenTemplateType";
import { ClsDCT_Common } from "../../commonModule/Class.common";

const _oCommonCls = new ClsDCT_Common();

export const getTemplateTypeCount = async (cSearchFilterQuery, cStatusFilter) => {
    try {
        const countAggregatePipeline = [
            cSearchFilterQuery,
            {
                $lookup: {
                    from: "gen_statuses",
                    localField: "iStatusID",
                    foreignField: "_id",
                    as: "oTemplateTypeListing"
                }
            },
            cStatusFilter,
            { $unwind: "$oTemplateTypeListing" },
            {
                $group: {
                    _id: null,
                    count: { $sum: 1 }
                }
            }
        ];
        const countResult = await GenTemplateType.aggregate(countAggregatePipeline);
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








export const getTemplateType = async (aRequestDetails, oSort, cSearchFilterQuery, iCount, cStatusFilter) => {
    let iLimitDynamic: number;
    if (aRequestDetails.iLimit <= 0 && iCount > 0) {
        iLimitDynamic = iCount;
    } else {
        iLimitDynamic = aRequestDetails.iLimit;
    }
    try {
        const oDocuments = await GenTemplateType.aggregate([
            cSearchFilterQuery,
            {
                $lookup: {
                    from: "gen_statuses",
                    localField: "iStatusID",
                    foreignField: "_id",
                    as: "oTemplateTypeListing"
                }
            },
            cStatusFilter,
            { $unwind: "$oTemplateTypeListing" },
            { $sort: oSort },
            { $skip: aRequestDetails.iOffsetLimit },
            { $limit: iLimitDynamic },
        ]);
        return oDocuments;
    }
    catch (eerr) { return false }



}