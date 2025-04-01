import { ClsDCT_Common } from "../../commonModule/Class.common";
import GenRegion, { IRegion } from "../../models/GenRegion"

const _oCommonCls = new ClsDCT_Common();

export const getRegionCount = async (cSearchFilterQuery) => {
    try {
        const countAggregatePipeline = [
            cSearchFilterQuery,
            {
                $lookup: {
                    from: "gen_statuses",
                    localField: "iStatusID",
                    foreignField: "_id",
                    as: "oRegionListing"
                }
            },
            { $unwind: "$oRegionListing" },
            {
                $group: {
                    _id: null,
                    count: { $sum: 1 }
                }
            }
        ];
        const countResult = await GenRegion.aggregate(countAggregatePipeline);
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

export const getRegions = async (aRequestDetails, oSort, cSearchFilterQuery, iCount) => {
    let iLimitDynamic: number;
    if (aRequestDetails.iLimit <= 0 && iCount > 0) {
        iLimitDynamic = iCount;
    } else {
        iLimitDynamic = aRequestDetails.iLimit;
    }
    const oDocuments = await GenRegion.aggregate([
        cSearchFilterQuery,
        {
            $lookup: {
                from: "gen_statuses",
                localField: "iStatusID",
                foreignField: "_id",
                as: "oRegionListing"
            }
        },
        { $unwind: "$oRegionListing" },
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
                cCode: 1,
                cName: 1,
                iStatusID: 1,
                iEnteredby: 1,
                tEntered: 1,
                cTemplateType: 1,
                iUpdatedby: 1,
                tUpdated: 1,
                oRegionListing: 1,

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