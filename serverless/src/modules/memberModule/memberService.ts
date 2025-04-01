import { Types } from "mongoose";
import { ClsDCT_Common } from "../../commonModule/Class.common";
import { getMember, getMemberCount } from "./memberDal";
import HttpStatusCodes from "http-status-codes";
import GenMember, { IMember } from "../../models/GenMember";
const _ = require('lodash');

export class MemberService {

    private _oCommonCls = new ClsDCT_Common();

    public memberListing = async (event) => {
        try {

            const body = JSON.parse(event.body);
            const { iOffset, iLimit, iOffsetLimit, cSearchFilter, cSort, cSortOrder, cTemplateTypes, aCode } = body;
            const aRequestDetails = { iOffset, iLimit, iOffsetLimit, cSearchFilter, cSort, cSortOrder, };

            let cSearchFilterQuery: any;
            if (aRequestDetails.cSearchFilter) {
                cSearchFilterQuery = { $match: { $or: [{ "cScac": { "$regex": aRequestDetails.cSearchFilter, "$options": "i" } }, { "cName": { "$regex": aRequestDetails.cSearchFilter, "$options": "i" } }] } };
            } else {
                cSearchFilterQuery = { $match: {} };
            }

            let oSort = {};
            if (aRequestDetails.cSort) {
                oSort[aRequestDetails.cSort] = aRequestDetails.cSortOrder;
            } else {
                oSort['_id'] = -1;
            }
            let cStatusFilter;
            if (aCode && aCode == 'Member') {
                cStatusFilter = {
                    $match: {
                        "oMemberListing": {
                            $elemMatch: { cStatusCode: "ACTIVE" }
                        }
                    }
                }
            }
            else {
                cStatusFilter = {
                    $match: {
                    }
                }
            }

            let iCount: number = await getMemberCount(cSearchFilterQuery, cStatusFilter);
            if (iCount > 0) {
                let oMember: any = await getMember(aRequestDetails, oSort, cSearchFilterQuery, iCount, cStatusFilter);

                if (oMember) {
                    let oMemberRes;
                    if (Array.isArray(cTemplateTypes) && cTemplateTypes.length > 0) {
                        const cTemplateTypesObjectIds = cTemplateTypes.map(id => new Types.ObjectId(id).toString());
                        const filteredMembers = _.filter(oMember, (member: any) => {
                            const cTemplateTypeStrings = member.cTemplateType.map((objectId: any) => objectId.toString());
                            return _.intersection(cTemplateTypeStrings, cTemplateTypesObjectIds).length > 0;
                        });
                        oMemberRes = {
                            total: filteredMembers.length,
                            page: aRequestDetails.iOffset,
                            pageSize: aRequestDetails.iLimit,
                            aModuleDetails: filteredMembers
                        };
                    }
                    else {
                        oMemberRes = {
                            total: iCount,
                            page: aRequestDetails.iOffset,
                            pageSize: aRequestDetails.iLimit,
                            aModuleDetails: oMember
                        };
                    }
                    return await this._oCommonCls.FunDCT_Handleresponse('Success', 'MEMBER', 'MEMBER_LISTED', 200, oMemberRes);
                }
            } else {
                let oMemberRes = {
                    total: 0,
                    page: 0,
                    pageSize: aRequestDetails.iLimit,
                    aModuleDetails: []
                };
                return await this._oCommonCls.FunDCT_Handleresponse('Success', 'MEMBER', 'MEMBER_LISTED', 200, oMemberRes);
            }
        } catch (err) {
            return await this._oCommonCls.FunDCT_Handleresponse('Error', 'APPLICATION', 'SERVER_ERROR', HttpStatusCodes.BAD_REQUEST, 'SERVER_ERROR');
        }

    }

    public memberAdd = async(event) => {
        try {
          const body = JSON.parse(event.body);
          const { cScac, cName, cAddress, cCity, cState, cPostalcode, cContinent, cTemplateType, cTel, cFax, cEmail, cContactperson, cLocationcode, cWebpage, iStatusID, cType } = body; //cType added by spirgonde for member,carrier dropdown
          const aRequestDetails = { cScac, cName, cAddress, cCity, cState, cPostalcode, cContinent,  cTemplateType: JSON.parse(cTemplateType), cTel, cFax, cEmail, cContactperson, cLocationcode, cWebpage, cType, iStatusID: iStatusID, iEnteredby: event.requestContext.authorizer._id, tEntered: new Date() };//cType added by spirgonde for member,carrier dropdown
    
          let oMember = await GenMember.findOne({ cScac: cScac, cName: cName }).lean() as  IMember;
          if (oMember) {
            // Update
            oMember = await GenMember.findOneAndUpdate(
              { cScac: cScac },
              { $set: aRequestDetails },
              { new: true }
            ).lean() as IMember;
           return await this._oCommonCls.FunDCT_Handleresponse('Success', 'MEMBER', 'MEMBER_UPDATED', 200, oMember);
          } else {
            // Create
            oMember = new GenMember(aRequestDetails);
            await oMember.save();
           return await this._oCommonCls.FunDCT_Handleresponse('Success', 'MEMBER', 'MEMBER_INSERTED', 200, oMember);
          }
        } catch (err) {
         return await this._oCommonCls.FunDCT_Handleresponse('Error', 'APPLICATION', 'SERVER_ERROR', HttpStatusCodes.BAD_REQUEST, 'SERVER_ERROR');
        }
      }

      public memberUpdate = async(event) =>{
        try {
            const body = JSON.parse(event.body);
    
          const { cScac, cName, cAddress, cCity, cState, cPostalcode, cContinent, cTemplateType, cTel, cFax, cEmail, cContactperson, cLocationcode, cWebpage, cType, iStatusID } =body; //cType added by spirgonde for member,carrier dropdown
          const aMemberFields = { cScac, cName, cAddress, cCity, cState, cPostalcode, cContinent, cTemplateType: JSON.parse(cTemplateType), cTel, cFax, cEmail, cContactperson, cLocationcode, cWebpage, cType, iStatusID: iStatusID, iUpdatedby: event.requestContext.authorizer._id, tUpdated: new Date() };//cType added by spirgonde for member,carrier dropdown
    
          let oMember = await GenMember.findOne({ _id: event.pathParameters.id }).lean() as IMember;
    
          if (oMember) {
            oMember = await GenMember.findOneAndUpdate(
              { _id: event.pathParameters.id },
              { $set: aMemberFields },
              { new: true }
            ).lean() as IMember;
            return await this._oCommonCls.FunDCT_Handleresponse('Success', 'MEMBER', 'MEMBER_UPDATED', 200, oMember);
    
          } else {
            return await this._oCommonCls.FunDCT_Handleresponse('Error', 'APPLICATION', 'SERVER_ERROR', HttpStatusCodes.BAD_REQUEST, 'SERVER_ERROR');
          }
        } catch (err) {
          return await this._oCommonCls.FunDCT_Handleresponse('Error', 'APPLICATION', 'SERVER_ERROR', HttpStatusCodes.BAD_REQUEST, 'SERVER_ERROR');
        }
      }

      public memberDelete = async(event) =>{
        let oMember = await GenMember.findOne({ _id: event.pathParameters.id }).lean() as IMember;
        if (oMember) {
          await GenMember.deleteOne({ _id: event.pathParameters.id }).then(result => {
            return true;
          });
          return await this._oCommonCls.FunDCT_Handleresponse('Success', 'MEMBER', 'MEMBER_DELETED', 200, event.pathParameters.id);
        }
        else {
          return await this._oCommonCls.FunDCT_Handleresponse('Error', 'APPLICATION', 'SERVER_ERROR', HttpStatusCodes.BAD_REQUEST, 'SERVER_ERROR');
        }
      }
}