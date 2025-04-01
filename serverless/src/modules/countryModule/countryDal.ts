import { ClsDCT_Common } from "../../commonModule/Class.common";
import GenCountry, { ICountry } from "../../models/GenCountry"

const _oCommonCls = new ClsDCT_Common();


export const getCountryCount = async (cSearchFilterQuery) => {
    try {
        const lRegionPipe = [
            {
                $lookup: {
                    from: "gen_regions",
                    localField: "iRegionID",
                    foreignField: "_id",
                    as: "oRegionListing"
                }
            },
            { $unwind: "$oRegionListing" }
        ];
        const countAggregatePipeline = [
            cSearchFilterQuery,
            {
                $lookup: {
                    from: "gen_statuses",
                    localField: "iStatusID",
                    foreignField: "_id",
                    as: "oCountryListing"
                }
            },
            { $unwind: "$oCountryListing" },
            ...lRegionPipe,
            {
                $group: {
                    _id: null,
                    count: { $sum: 1 }
                }
            }
        ];
        const countResult = await GenCountry.aggregate(countAggregatePipeline);
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


export const getCountry = async (aRequestDetails, oSort, cSearchFilterQuery, iCount) => {
    let iLimitDynamic: number;
    if (aRequestDetails.iLimit <= 0 && iCount > 0) {
        iLimitDynamic = iCount;
    } else {
        iLimitDynamic = aRequestDetails.iLimit;
    }
    const lRegionPipe = [
        {
            $lookup: {
                from: "gen_regions",
                localField: "iRegionID",
                foreignField: "_id",
                as: "oRegionListing"
            }
        },
        { $unwind: "$oRegionListing" }
    ];
    const oDocuments = await GenCountry.aggregate([

        cSearchFilterQuery,
        {
            $lookup: {
                from: "gen_statuses",
                localField: "iStatusID",
                foreignField: "_id",
                as: "oCountryListing"
            }
        },
        { $unwind: "$oCountryListing" },
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
        /* In below block of code $unwind is modified by adding "path" and "preserveNullAndEmptyArrays": true ,so that if "iUpdatedby" 
          is not found in collection then preiviously aggregated collection can be returned  */
        {
            "$unwind": {
                "path": "$oUpdatedby",
                "preserveNullAndEmptyArrays": true
            }
        },
        // {
        //   $lookup: {
        //     from: "gen_regions",
        //     localField: "iRegionID",
        //     foreignField: "_id",
        //     as: "oRegionsListing"
        //   }
        // },
        // { $unwind: "$oRegionsListing" },
        //code added by spirgonde for changing entered by  and Updated By from Id to user name  end .  
        ...lRegionPipe,
        { $sort: oSort },
        { $skip: aRequestDetails.iOffsetLimit },
        { $limit: iLimitDynamic },
        {
            $project: {
                _id: 1,
                iRegionID: 1,
                cCode: 1,
                cName: 1,
                cCurrencycode: 1,
                cDefaultcountry: 1,
                iStatusID: 1,
                iEnteredby: 1,
                tEntered: 1,
                iUpdatedby: 1,
                tUpdated: 1,
                oCountryListing: 1,

                "oUserListing._id": 1,
                "oUserListing.cName": 1,
                "oUserListing.cUsername": 1,

                // "oRegionsListing._id": 1,
                // "oRegionsListing.cName": 1,
                // "oRegionsListing.cCode": 1,

                "oUpdatedby._id": 1,
                "oUpdatedby.cName": 1,
                "oUpdatedby.cUsername": 1,
            }
        }
    ]
    );//call back removed

    return oDocuments;
}