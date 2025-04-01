import { ClsDCT_Common } from "../../commonModule/Class.common";
import User, { IUser } from "../../models/GenUser";

const _oCommonCls = new ClsDCT_Common();

export const getUserCount = async (cSearchFilterQuery) => {
    try {
        const countAggregatePipeline = [
            cSearchFilterQuery,
            {
                $lookup: {
                    from: "gen_statuses",
                    localField: "iStatusID",
                    foreignField: "_id",
                    as: "oUserListing"
                }
            },
            { $unwind: "$oUserListing" },
            {
                $lookup: {
                    from: "gen_accesstypes",
                    localField: "iAccessTypeID",
                    foreignField: "_id",
                    as: "oAccessTypeListing"
                }
            },
            { $unwind: "$oAccessTypeListing" },
            {
                $group: {
                    _id: null,
                    count: { $sum: 1 }
                }
            }
        ];
        const countResult = await User.aggregate(countAggregatePipeline);
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

export const getUser = async (aRequestDetails, oSort, cSearchFilterQuery, iCount) => {
    let iLimitDynamic: number;

    try {
        if (aRequestDetails.iLimit <= 0 && iCount > 0) {
            iLimitDynamic = iCount;
        } else {
            iLimitDynamic = aRequestDetails.iLimit;
        }
        const oDocuments = await User.aggregate([
            {
                $lookup: {
                    from: "gen_statuses",
                    localField: "iStatusID",
                    foreignField: "_id",
                    as: "oStatusListing"
                }
            },
            { $unwind: "$oStatusListing" },
            {
                $lookup: {
                    from: "gen_accesstypes",
                    localField: "iAccessTypeID",
                    foreignField: "_id",
                    as: "oAccessTypeListing"
                }
            },
            { $unwind: "$oAccessTypeListing" },

            {
                $lookup: {
                    from: "gen_members",
                    localField: "cCompanyname",
                    foreignField: "cScac",
                    as: "oMemberListing"
                }
            },
            { $unwind: "$oMemberListing" },
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
            cSearchFilterQuery,
            //code added by spirgonde for changing entered by  and Updated By from Id to user name  end .  
            { $sort: oSort },
            { $skip: aRequestDetails.iOffsetLimit },
            { $limit: iLimitDynamic },
            {
                $project: {
                    _id: 1,
                    iAccessTypeID: 1,
                    cEmail: 1,
                    // cPassword: 1,
                    cAvatar: 1,
                    cName: 1,
                    cUsername: 1,
                    cCompanyname: 1,
                    cAddress: 1,
                    cCity: 1,
                    cPostalcode: 1,
                    cState: 1,
                    cPhone: 1,
                    cFax: 1,
                    iStatusID: 1,
                    iEnteredby: 1,
                    tEntered: 1,
                    tUpdated: 1,
                    oStatusListing: 1,
                    oAccessTypeListing: 1,
                    oMemberListing: 1,
                    cTemplateType: 1,

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
    } catch (error) {
        return false
    }
}

export const checkUserName = async (cUsername) => {
    let oData = await User.findOne({
        $or: [
            { cUsername: cUsername },
            { cUsername: cUsername.toLowerCase() }
        ]
    });
    if (oData) {
        return true;
    }
    else {
        return false;
    }
}


export const checkUserEmail = async (cEmail) => {
    let oData = await User.findOne({
        $or: [
            { cEmail: cEmail },
            { cEmail: cEmail.toLowerCase() }
        ]
    });
    if (oData) {
        return true;
    }
    else {
        return false;
    }
}

export const checkUserNameUpdate = async(oReq)=> {
    let oData = await User.findOne({
      $and: [
        { _id: { $ne: oReq._id } },
        {
          $or: [
            { cUsername: oReq.cUsername },
            { cUsername: oReq.cUsername.toLowerCase() }
          ]
        }]

    }).lean() as IUser;
    if (oData) {
      return true;
    }
    else {
      return false;
    }
  }


  export const checkUserEmailUpdate = async(oReq) =>{
    let oData = await User.findOne({
      $and: [
        { _id: { $ne: oReq._id } },
        {
          $or: [
            { cEmail: oReq.cEmail },
            { cEmail: oReq.cEmail.toLowerCase() }
          ]
        }]

    }).lean() as IUser;
    if (oData) {
      return true;
    }
    else {
      return false;
    }
  }