import { ClsDCT_Common } from "../../commonModule/Class.common";
import Permission, { IPermission } from "../../models/GenPermission";
import { getPermission, getPermissionCount } from "./permissionDal";
import HttpStatusCodes from "http-status-codes";




export class PermissionService {
  private _oCommonCls = new ClsDCT_Common();

  public permissionListing = async (event) => {
    try {
      const body = JSON.parse(event.body);
      const { iOffset, iLimit, iOffsetLimit, cSearchFilter, cSort, cSortOrder } = body;
      const aRequestDetails = { iOffset, iLimit, iOffsetLimit, cSearchFilter, cSort, cSortOrder };

      let cSearchFilterQuery: any;
      if (aRequestDetails.cSearchFilter) {
        // cSearchFilterQuery = { $match: { $or: [{ "cAccessCode": { "$regex": aRequestDetails.cSearchFilter, "$options": "i" } }, { "cProcessCode": { "$regex": aRequestDetails.cSearchFilter, "$options": "i" } }] } };
        // added below code so that results can be fetched from multiple collections by spirgonde to solve searchfilter issue  
        cSearchFilterQuery = {
          $match: {
            $or: [{ "oProcessListing.cProcessCode": { "$regex": aRequestDetails.cSearchFilter, "$options": "i" } },
            { "oAccessTypeListing.cAccessCode": { "$regex": aRequestDetails.cSearchFilter, "$options": "i" } }]
          }
        }
      } else {
        cSearchFilterQuery = { $match: {} };
      }

      let oSort = {};
      if (aRequestDetails.cSort) {
        oSort[aRequestDetails.cSort] = aRequestDetails.cSortOrder;
      } else {
        oSort['_id'] = -1;
      }

      let iCount = await getPermissionCount(cSearchFilterQuery) as number;
      if (iCount > 0) {
        let opermissions: any = await getPermission(aRequestDetails, oSort, cSearchFilterQuery, iCount);
        if (opermissions) {
          let oPermissionRes = {
            total: iCount,
            page: aRequestDetails.iOffset,
            pageSize: aRequestDetails.iLimit,
            aModuleDetails: opermissions
          };
          return await this._oCommonCls.FunDCT_Handleresponse('Success', 'PERMISSION', 'PERMISSION_LISTED', 200, oPermissionRes);
        }
      } else {
        let oPermissionRes = {
          total: 0,
          page: 0,
          pageSize: aRequestDetails.iLimit,
          aModuleDetails: []
        };
        return await this._oCommonCls.FunDCT_Handleresponse('Success', 'PERMISSION', 'PERMISSION_LISTED', 200, oPermissionRes);
      }
    } catch (err) {
      return await this._oCommonCls.FunDCT_Handleresponse('Error', 'APPLICATION', 'SERVER_ERROR', HttpStatusCodes.BAD_REQUEST, 'SERVER_ERROR');
    }

  }


  public permissionAdd = async (event) => {
    try {
      const body = JSON.parse(event.body);
      const { iAccessTypeID, iProcessID, cAdd, cEdit, cView, cDelete, iStatusID } = body;
      const aRequestDetails = { iAccessTypeID, iProcessID, cAdd, cEdit, cView, cDelete, iStatusID: iStatusID, iEnteredby: event.requestContext.authorizer._id, tEntered: new Date() };

      let oPermission = await Permission.findOne({ iAccessTypeID: iAccessTypeID, iProcessID: iProcessID }).lean() as IPermission;
      if (oPermission) {
        // Update
        oPermission = await Permission.findOneAndUpdate(
          { iAccessTypeID: iAccessTypeID },
          { $set: aRequestDetails },
          { new: true }
        ).lean() as IPermission;
        return await this._oCommonCls.FunDCT_Handleresponse('Success', 'PERMISSION', 'PERMISSION_UPDATED', 200, oPermission);
      } else {
        // Create
        oPermission = new Permission(aRequestDetails);
        await oPermission.save();
        return await this._oCommonCls.FunDCT_Handleresponse('Success', 'PERMISSION', 'PERMISSION_INSERTED', 200, oPermission);
      }
    } catch (err) {
      return await this._oCommonCls.FunDCT_Handleresponse('Error', 'APPLICATION', 'SERVER_ERROR', HttpStatusCodes.BAD_REQUEST, 'SERVER_ERROR');
    }
  }

  public permissionUpdate = async (event) => {
    try {
      const body = JSON.parse(event.body);
      const { cAccessCode, cProcessCode, cAdd, cEdit, cView, cDelete, iProcessID, iStatusID } = body;
      const aPermissionFields = {
        cAccessCode,
        cProcessCode,
        cAdd,
        cEdit,
        cView,
        cDelete,
        iProcessID,
        iStatusID: iStatusID,
        // iEnteredby: event.requestContext.authorizer._id,
        // tEntered: new Date()
        iUpdatedby: event.requestContext.authorizer._id,
        tUpdated: new Date()
      };

      let oPermission = await Permission.findOne({ _id: event.pathParameters.id }).lean() as IPermission;

      if (oPermission) {
        oPermission = await Permission.findOneAndUpdate(
          { _id: event.pathParameters.id },
          { $set: aPermissionFields },
          { new: true }
        ).lean() as IPermission;
        return await this._oCommonCls.FunDCT_Handleresponse('Success', 'PERMISSION', 'PERMISSION_UPDATED', 200, oPermission);

      } else {
        return await this._oCommonCls.FunDCT_Handleresponse('Error', 'APPLICATION', 'SERVER_ERROR', HttpStatusCodes.BAD_REQUEST, 'SERVER_ERROR');
      }
    } catch (err) {
      return await this._oCommonCls.FunDCT_Handleresponse('Error', 'APPLICATION', 'SERVER_ERROR', HttpStatusCodes.BAD_REQUEST, 'SERVER_ERROR');
    }
  }

  public permissionDelete = async (event) => {
    let oPermission = await Permission.findOne({ _id: event.pathParameters.id }).lean() as IPermission;
    if (oPermission) {
      await Permission.deleteOne({ _id: event.pathParameters.id }).then(result => {
        return true;
      });
      return await this._oCommonCls.FunDCT_Handleresponse('Success', 'PERMISSION', 'PERMISSION_DELETED', 200, event.pathParameters.id);
    } else {
      return await this._oCommonCls.FunDCT_Handleresponse('Error', 'APPLICATION', 'SERVER_ERROR', HttpStatusCodes.BAD_REQUEST, 'SERVER_ERROR');
    }
  }
}