import { ClsDCT_Common } from "../../commonModule/Class.common";
import HttpStatusCodes from "http-status-codes";
import { getRestrictionCount, getRestrictions } from "./memberRestrictionDal";
import MemberRestriction, { IMemberRestriction } from "../../models/MemberRestriction";



export class MemberRestrictionService {
  private _oCommonCls = new ClsDCT_Common();

  public restrictionListing = async (event) => {
    try {

      const body = JSON.parse(event.body);
      const { iOffset, iLimit, iOffsetLimit, cSearchFilter, cSort, cSortOrder } = body;
      const aRequestDetails = { iOffset, iLimit, iOffsetLimit, cSearchFilter, cSort, cSortOrder };

      let cSearchFilterQuery: any;
      if (aRequestDetails.cSearchFilter) {
        cSearchFilterQuery = { $match: { $or: [{ "cType": { "$regex": aRequestDetails.cSearchFilter, "$options": "i" } }, { "cTemplateType": { "$regex": aRequestDetails.cSearchFilter, "$options": "i" } }] } };
      } else {
        cSearchFilterQuery = { $match: {} };
      }

      let oSort = {};
      if (aRequestDetails.cSort) {
        oSort[aRequestDetails.cSort] = aRequestDetails.cSortOrder;
      } else {
        oSort['_id'] = -1;
      }

      let iCount: number = await getRestrictionCount(cSearchFilterQuery);
      if (iCount > 0) {
        let oMemberRestriction: any = await getRestrictions(aRequestDetails, oSort, cSearchFilterQuery, iCount);
        if (oMemberRestriction) {
          let oMemberRestrictionRes = {
            total: iCount,
            page: aRequestDetails.iOffset,
            pageSize: aRequestDetails.iLimit,
            aModuleDetails: oMemberRestriction
          };
          return await this._oCommonCls.FunDCT_Handleresponse('Success', 'MEMBER_RESTRICTION', 'MEMBER_RESTRICTION_LISTED', 200, oMemberRestrictionRes);
        }
      } else {
        let oMemberRestrictionRes = {
          total: 0,
          page: 0,
          pageSize: aRequestDetails.iLimit,
          aModuleDetails: []
        };
        return await this._oCommonCls.FunDCT_Handleresponse('Success', 'MEMBER_RESTRICTION', 'MEMBER_RESTRICTION_LISTED', 200, oMemberRestrictionRes);
      }
    } catch (err) {
      return await this._oCommonCls.FunDCT_Handleresponse('Error', 'APPLICATION', 'SERVER_ERROR', HttpStatusCodes.BAD_REQUEST, 'SERVER_ERROR');
    }

  }


  public restrictionAdd = async (event) => {
    try {
      const body = JSON.parse(event.body);
      const { cType, cTemplateType, cRestrictedScacCode, cAllowedScacCode, cExceptionMessage, iStatusID } = body;
      const aRequestDetails = { cType, cTemplateType, cRestrictedScacCode, cAllowedScacCode, cExceptionMessage, iStatusID: iStatusID, iEnteredby: event.requestContext.authorizer._id, tEntered: new Date() };

      let oMemberRestriction = await MemberRestriction.findOne({ cType: cType, cTemplateType: cTemplateType, cRestrictedScacCode: cRestrictedScacCode }).lean() as IMemberRestriction;
      if (oMemberRestriction) {
        oMemberRestriction = await MemberRestriction.findOneAndUpdate(
          { cType: cType, cTemplateType: cTemplateType, cRestrictedScacCode: cRestrictedScacCode },
          { $set: aRequestDetails },
          { new: true }
        ).lean() as any;
        return await this._oCommonCls.FunDCT_Handleresponse('Success', 'MEMBER_RESTRICTION', 'MEMBER_RESTRICTION_UPDATED', 200, oMemberRestriction);
      } else {
        oMemberRestriction = new MemberRestriction(aRequestDetails);
        await oMemberRestriction.save();
        return await this._oCommonCls.FunDCT_Handleresponse('Success', 'MEMBER_RESTRICTION', 'MEMBER_RESTRICTION_INSERTED', 200, oMemberRestriction);
      }
    } catch (err) {
      return await this._oCommonCls.FunDCT_Handleresponse('Error', 'APPLICATION', 'SERVER_ERROR', HttpStatusCodes.BAD_REQUEST, err);
    }
  }


  public restrictionUpdate = async (event) => {
    try {
      const body = JSON.parse(event.body);
      const { cType, cTemplateType, cRestrictedScacCode, cAllowedScacCode, cExceptionMessage, iStatusID } = body;
      const aMemberRestrictionFields = {
        cType, cTemplateType, cRestrictedScacCode, cAllowedScacCode, cExceptionMessage,
        iStatusID: iStatusID,
        iUpdatedby: event.requestContext.authorizer._id,
        tUpdated: new Date()
      };

      let oMemberRestriction = await MemberRestriction.findOne({ _id: event.pathParameters.id }).lean() as IMemberRestriction;

      if (oMemberRestriction) {
        oMemberRestriction = await MemberRestriction.findOneAndUpdate(
          { _id: event.pathParameters.id },
          { $set: aMemberRestrictionFields },
          { new: true }
        ).lean() as IMemberRestriction;
        return await this._oCommonCls.FunDCT_Handleresponse('Success', 'MEMBER_RESTRICTION', 'MEMBER_RESTRICTION_UPDATED', 200, oMemberRestriction);

      } else {
        return await this._oCommonCls.FunDCT_Handleresponse('Error', 'APPLICATION', 'SERVER_ERROR', HttpStatusCodes.BAD_REQUEST, 'SERVER_ERROR');
      }
    } catch (err) {
      return await this._oCommonCls.FunDCT_Handleresponse('Error', 'APPLICATION', 'SERVER_ERROR', HttpStatusCodes.BAD_REQUEST, err);
    }
  }

  public memberRestrictionDelete = async (event) => {
    let oMemberRestriction = await MemberRestriction.findOne({ _id: event.pathParameters.id }) as IMemberRestriction;
    if (oMemberRestriction) {
      await MemberRestriction.deleteOne({ _id: event.pathParameters.id }).then(result => {
        return true;
      });
      return await this._oCommonCls.FunDCT_Handleresponse('Success', 'MEMBER_RESTRICTION', 'MEMBER_RESTRICTION_DELETED', 200, event.pathParameters.id);
    } else {
      return await this._oCommonCls.FunDCT_Handleresponse('Error', 'APPLICATION', 'SERVER_ERROR', HttpStatusCodes.BAD_REQUEST, 'Not found any oMemberRestriction');
    }
  }

}