import { ClsDCT_Common } from "../../commonModule/Class.common";
import HttpStatusCodes from "http-status-codes";
import GenCarrier, { ICarrier } from "../../models/GenCarrier"
import { getCarrier, getCarrierCount } from "./carrierDal";



export class CarrierService {
    private _oCommonCls = new ClsDCT_Common();

    public carrierListing = async (event) => {
        try {
            let cToken = event.headers?.['x-wwadct-token'] || event.headers?.['X-WWADCT-TOKEN'];
            if (cToken) {
                await this._oCommonCls.FunDCT_SetCurrentUserDetails(cToken);
            }
            this._oCommonCls.FunDCT_ApiRequest(event)
            const body = JSON.parse(event.body);
            const { iOffset, iLimit, iOffsetLimit, cSearchFilter, cSort, cSortOrder } = body;
            const aRequestDetails = { iOffset, iLimit, iOffsetLimit, cSearchFilter, cSort, cSortOrder };

            let cSearchFilterQuery: any;
            if (aRequestDetails.cSearchFilter) {
                cSearchFilterQuery = { $match: { $or: [{ "cCarrierScac ": { "$regex": aRequestDetails.cSearchFilter, "$options": "i" } }, { "cCarrierName": { "$regex": aRequestDetails.cSearchFilter, "$options": "i" } }] } };
            } else {
                cSearchFilterQuery = { $match: {} };
            }

            let oSort = {};
            if (aRequestDetails.cSort) {
                oSort[aRequestDetails.cSort] = aRequestDetails.cSortOrder;
            } else {
                oSort['_id'] = -1;
            }

            let iCount: number = await getCarrierCount(cSearchFilterQuery);
            if (iCount > 0) {
                let oCarrier: any = await getCarrier(aRequestDetails, oSort, cSearchFilterQuery, iCount);
                if (oCarrier) {
                    let oCarrierRes = {
                        total: iCount,
                        page: aRequestDetails.iOffset,
                        pageSize: aRequestDetails.iLimit,
                        aModuleDetails: oCarrier
                    };
                    return await this._oCommonCls.FunDCT_Handleresponse('Success', 'CARRIER', 'CARRIER_LISTED', 200, oCarrierRes);
                }
            } else {
                let oCarrierRes = {
                    total: 0,
                    page: 0,
                    pageSize: aRequestDetails.iLimit,
                    aModuleDetails: []
                };
                return await this._oCommonCls.FunDCT_Handleresponse('Success', 'CARRIER', 'CARRIER_LISTED', 200, oCarrierRes);
            }
        } catch (err) {
            return await this._oCommonCls.FunDCT_Handleresponse('Error', 'APPLICATION', 'SERVER_ERROR', HttpStatusCodes.BAD_REQUEST, 'SERVER_ERROR');
        }

    }

    public carrierAdd = async (event) => {
        try {

            let cToken = event.headers?.['x-wwadct-token'] || event.headers?.['X-WWADCT-TOKEN'];
            if (cToken) {
                await this._oCommonCls.FunDCT_SetCurrentUserDetails(cToken);
            }
            this._oCommonCls.FunDCT_ApiRequest(event)
            const body = JSON.parse(event.body);
            const { cCarrierScac, cCarrierName, cAddress, cCity, cState, cPostalcode, cContinent, cTel, cFax, cCarrierEmail,
                cContactperson, cLocationcode, cWebpage, iStatusID } = body;

            const aRequestDetails = {
                cCarrierScac, cCarrierName, cAddress, cCity, cState, cPostalcode, cContinent, cTel, cFax,
                cCarrierEmail, cContactperson, cLocationcode, cWebpage, iStatusID, iEnteredby: event.requestContext.authorizer._id, tEntered: new Date()
            };

            let oCarrier = await GenCarrier.findOne({ cCarrierScac: cCarrierScac, cCarrierName: cCarrierName }).lean() as ICarrier;
            if (oCarrier) {
                // Update
                oCarrier = await GenCarrier.findOneAndUpdate(
                    { cCarrierScac: cCarrierScac },
                    { $set: aRequestDetails },
                    { new: true }
                ).lean() as ICarrier;
                return await this._oCommonCls.FunDCT_Handleresponse('Success', 'CARRIER', 'CARRIER_UPDATED', 200, oCarrier);
            } else {
                // Create
                oCarrier = new GenCarrier(aRequestDetails);
                await oCarrier.save();
                return await this._oCommonCls.FunDCT_Handleresponse('Success', 'CARRIER', 'CARRIER_INSERTED', 200, oCarrier);
            }
        } catch (err) {
            return await this._oCommonCls.FunDCT_Handleresponse('Error', 'APPLICATION', 'SERVER_ERROR', HttpStatusCodes.BAD_REQUEST, 'SERVER_ERROR');
        }
    }

    public carrierUpdate = async (event) => {
        try {
            let cToken = event.headers?.['x-wwadct-token'] || event.headers?.['X-WWADCT-TOKEN'];
            if (cToken) {
                await this._oCommonCls.FunDCT_SetCurrentUserDetails(cToken);
            }
            this._oCommonCls.FunDCT_ApiRequest(event)
            const body = JSON.parse(event.body);
            const { cCarrierScac, cCarrierName, cAddress, cCity, cState, cPostalcode, cContinent, cTel, cFax, cCarrierEmail,
                cContactperson, cLocationcode, cWebpage, iStatusID } = body;
            const aMessageFields = {
                cCarrierScac, cCarrierName, cAddress, cCity, cState, cPostalcode, cContinent, cTel, cFax, cCarrierEmail,
                cContactperson, cLocationcode, cWebpage, iStatusID: iStatusID, iUpdatedby: event.requestContext.authorizer._id, tUpdated: new Date()
            };

            let oCarrier = await GenCarrier.findOne({ _id: event.pathParameters.id }).lean() as ICarrier;

            if (oCarrier) {
                oCarrier = await GenCarrier.findOneAndUpdate(
                    { _id: event.pathParameters.id },
                    { $set: aMessageFields },
                    { new: true }
                ).lean() as ICarrier;;
                return await this._oCommonCls.FunDCT_Handleresponse('Success', 'CARRIER', 'CARRIER_UPDATED', 200, oCarrier);

            } else {
                return await this._oCommonCls.FunDCT_Handleresponse('Error', 'APPLICATION', 'SERVER_ERROR', HttpStatusCodes.BAD_REQUEST, 'SERVER_ERROR');
            }
        } catch (err) {
            return await this._oCommonCls.FunDCT_Handleresponse('Error', 'APPLICATION', 'SERVER_ERROR', HttpStatusCodes.BAD_REQUEST, 'SERVER_ERROR');
        }
    }

    public carrierDelete = async (event) => {
        let oCarrier = await GenCarrier.findOne({ _id: event.pathParameters.id }).lean() as ICarrier;
        if (oCarrier) {
            await GenCarrier.deleteOne({ _id: event.pathParameters.id }).then(result => {
                return true;
            });
            return await this._oCommonCls.FunDCT_Handleresponse('Success', 'CARRIER', 'CARRIER_DELETED', 200, event.pathParameters.id);
        } else {
            return await this._oCommonCls.FunDCT_Handleresponse('Error', 'APPLICATION', 'SERVER_ERROR', HttpStatusCodes.BAD_REQUEST, 'SERVER_ERROR');
        }
    }

}