import { ClsDCT_Common } from "../../commonModule/Class.common";
import HttpStatusCodes from "http-status-codes";
import { getLocation, getLocationCount } from "./locationDal";
import Location, { ILocation } from "../../models/GenLocation";


export class LocationService {
    private _oCommonCls = new ClsDCT_Common();

    public locationListing = async (event) => {
        try {
            const body = JSON.parse(event.body);

            const { iOffset, iLimit, iOffsetLimit, cSearchFilter, cSort, cSortOrder } = body;
            const aRequestDetails = { iOffset, iLimit, iOffsetLimit, cSearchFilter, cSort, cSortOrder };

            let cSearchFilterQuery: any;
            if (aRequestDetails.cSearchFilter) {
                cSearchFilterQuery = { $match: { $or: [{ "cCode": { "$regex": aRequestDetails.cSearchFilter, "$options": "i" } }, { "cCountryCode": { "$regex": aRequestDetails.cSearchFilter, "$options": "i" } }] } };
            } else {
                cSearchFilterQuery = { $match: {} };
            }

            let oSort = {};
            if (aRequestDetails.cSort) {
                oSort[aRequestDetails.cSort] = aRequestDetails.cSortOrder;
            } else {
                oSort['_id'] = -1;
            }

            let iCount: number = await getLocationCount(cSearchFilterQuery);
            if (iCount > 0) {
                let oLocations: any = await getLocation(aRequestDetails, oSort, cSearchFilterQuery, iCount);
                if (oLocations) {
                    let oLocationRes = {
                        total: iCount,
                        page: aRequestDetails.iOffset,
                        pageSize: aRequestDetails.iLimit,
                        aModuleDetails: oLocations
                    };
                    return await this._oCommonCls.FunDCT_Handleresponse('Success', 'LOCATION', 'LOCATION_LISTED', 200, oLocationRes);
                }
            } else {
                let oLocationRes = {
                    total: 0,
                    page: 0,
                    pageSize: aRequestDetails.iLimit,
                    aModuleDetails: []
                };
                return await this._oCommonCls.FunDCT_Handleresponse('Success', 'LOCATION', 'LOCATION_LISTED', 200, oLocationRes);
            }
        } catch (err) {
            return await this._oCommonCls.FunDCT_Handleresponse('Error', 'APPLICATION', 'SERVER_ERROR', HttpStatusCodes.BAD_REQUEST, err);
        }

    }

    public locationAdd = async (event) => {
        try {
            const body = JSON.parse(event.body);
            const { cCode, cCountryCode, iStatusID, cCityName } = body;
            const aRequestDetails = { cCode, cCountryCode, cCityName, iStatusID: iStatusID, iEnteredby: event.requestContext.authorizer._id, tEntered: new Date() };

            let oLocation = await Location.findOne({ cCode: cCode, cCountryCode: cCountryCode, cCityName: cCityName }).lean() as ILocation;
            if (oLocation) {
                // Update
                oLocation = await Location.findOneAndUpdate(
                    { cCode: cCode },
                    { $set: aRequestDetails },
                    { new: true }
                ).lean() as ILocation;;
                return await this._oCommonCls.FunDCT_Handleresponse('Success', 'LOCATION', 'LOCATION_UPDATED', 200, oLocation);
            } else {
                // Create
                oLocation = new Location(aRequestDetails);
                await oLocation.save();
                return await this._oCommonCls.FunDCT_Handleresponse('Success', 'LOCATION', 'LOCATION_INSERTED', 200, oLocation);
            }
        } catch (err) {
            if (err.code == 11000) {
                return await this._oCommonCls.FunDCT_Handleresponse('Error', 'LOCATION', 'LOCATION_ALREADY_EXISTS', HttpStatusCodes.BAD_REQUEST, '');
            }
            else {
                return await this._oCommonCls.FunDCT_Handleresponse('Error', 'APPLICATION', 'SERVER_ERROR', HttpStatusCodes.BAD_REQUEST, 'SERVER_ERROR');
            }
        }
    }

    public locationUpdate = async(event)=>{
        try {
          
            const body = JSON.parse(event.body);
          const { cCode, cCountryCode, iStatusID, cCityName } = body;
          const aLocationFields = {
            cCode,
            cCountryCode,
            cCityName,
            iStatusID: iStatusID,
            iUpdatedby: event.requestContext.authorizer._id,
            tUpdated: new Date() // changed tEntered to tUpdated
          };
    
          let oLocation = await Location.findOne({ _id: event.pathParameters.id }).lean() as ILocation;
    
          if (oLocation) {
            oLocation = await Location.findOneAndUpdate(
              { _id: event.pathParameters.id },
              { $set: aLocationFields },
              { new: true }
            ).lean() as ILocation;;
            return await this._oCommonCls.FunDCT_Handleresponse('Success', 'LOCATION', 'LOCATION_UPDATED', 200, oLocation);
    
          } else {
            return await this._oCommonCls.FunDCT_Handleresponse('Error', 'APPLICATION', 'SERVER_ERROR', HttpStatusCodes.BAD_REQUEST,'Error: Location Updated ');
          }
        } catch (err) {
          if (err.code==11000) {
            return await this._oCommonCls.FunDCT_Handleresponse('Error', 'LOCATION', 'LOCATION_ALREADY_EXISTS', HttpStatusCodes.BAD_REQUEST, '');
          }
          else{
            return await this._oCommonCls.FunDCT_Handleresponse('Error', 'APPLICATION', 'SERVER_ERROR', HttpStatusCodes.BAD_REQUEST, 'SERVER_ERROR');
          }
          // await this.FunDCT_Handleresponse('Error', 'APPLICATION', 'SERVER_ERROR', HttpStatusCodes.BAD_REQUEST, 'SERVER_ERROR', req, res,err);
        }
      }

      public locationDelete = async(event)=> {
        let oLocation  = await Location.findOne({ _id: event.pathParameters.id }).lean() as ILocation;
        if (oLocation) {
          await Location.deleteOne({ _id: event.pathParameters.id }).then(result => {
            return true;
          });
          return await this._oCommonCls.FunDCT_Handleresponse('Success', 'LOCATION', 'LOCATION_DELETED', 200, event.pathParameters.id);
        } else {
          return await this._oCommonCls.FunDCT_Handleresponse('Error', 'APPLICATION', 'SERVER_ERROR', HttpStatusCodes.BAD_REQUEST,'Error : LOCATION_DELETED');
        }
      }
}