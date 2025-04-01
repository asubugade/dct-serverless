import { ClsDCT_Common } from "../../commonModule/Class.common";
import Emailtemplates from "../../models/GenEmailtemplates";

const _oCommonCls = new ClsDCT_Common();

export const getEmailtemplatesCount = async (cSearchFilterQuery) => {

    try {
        const countAggregatePipeline = [
            cSearchFilterQuery,
            {
                $lookup: {
                    from: "gen_statuses",
                    localField: "iStatusID",
                    foreignField: "_id",
                    as: "oEmailtemplatesListing"
                }
            },
            { $unwind: "$oEmailtemplatesListing" },
            {
                $group: {
                    _id: null,
                    count: { $sum: 1 }
                }
            }
        ];
        const countResult = await Emailtemplates.aggregate(countAggregatePipeline);
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


export const getEmailtemplates = async (aRequestDetails, oSort, cSearchFilterQuery, iCount) => {
    let iLimitDynamic: number;
    if (aRequestDetails.iLimit <= 0 && iCount > 0) {
        iLimitDynamic = iCount;
    } else {
        iLimitDynamic = aRequestDetails.iLimit;
    }
    const oDocuments = await Emailtemplates.aggregate([
        cSearchFilterQuery,
        {
            $lookup: {
                from: "gen_statuses",
                localField: "iStatusID",
                foreignField: "_id",
                as: "oEmailtemplatesListing"
            }
        },
        { $unwind: "$oEmailtemplatesListing" },
        {
            $lookup: {
                from: "gen_processes",
                localField: "iProcessID",
                foreignField: "_id",
                as: "oProcessListing"
            }
        },
        { $unwind: "$oProcessListing" },
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
        //code added by spirgonde for changing entered by  and Updated By from Id to user name  end .  

        { $sort: oSort },
        { $skip: aRequestDetails.iOffsetLimit },
        { $limit: iLimitDynamic },
        {
            $project: {
                _id: 1,
                iProcessID: 1,
                cEmailType: 1,
                cSubject: 1,
                cFromEmailText: 1,
                cEmailBody: 1,
                cFrom: 1,
                cBcc: 1,
                iStatusID: 1,
                iEnteredby: 1,
                tEntered: 1,
                iUpdatedby: 1,
                tUpdated: 1,
                oEmailtemplatesListing: 1,
                oProcessListing: 1,

                "oUserListing._id": 1,
                "oUserListing.cName": 1,
                "oUserListing.cUsername": 1,
                // "oUserListing.iAccessTypeID": 1,
                // "oUserListing.cEmail": 1,
                // "oUserListing.cPassword": 1,
                // "oUserListing.cAvatar": 1,
                // "oUserListing.cCompanyname": 1,
                // "oUserListing.cAddress": 1,
                // "oUserListing.cCity": 1,
                // "oUserListing.cPostalcode": 1,
                // "oUserListing.cState": 1,
                // "oUserListing.cPhone": 1,
                // "oUserListing.cFax": 1,
                // "oUserListing.iStatusID": 1,
                // "oUserListing.tEntered": 1,
                // "oUserListing.cPwdToken": 1,
                // "oUserListing.iUpdatedby": 1,
                // "oUserListing.tUpdated": 1,
                // "oUserListing.iEnteredby": 1,

                "oUpdatedby._id": 1,
                "oUpdatedby.cName": 1,
                "oUpdatedby.cUsername": 1,
            },
        }
    ]);//Callback removed

    return oDocuments;
}