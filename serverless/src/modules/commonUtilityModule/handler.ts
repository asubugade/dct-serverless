import { ClsDCT_Common } from "../../commonModule/Class.common";
import HttpStatusCodes from "http-status-codes";
import oConnectDB from "../../config/database";
import { CommonUtilityService } from "./commonUtilityService";


const _oCommonCls = new ClsDCT_Common();
const commonUtilityService = new CommonUtilityService()
const parser = require('lambda-multipart-parser')
const mime = require('mime-types'); // Install with npm install mime-types

module.exports.downloadS3FileHandler = async (event, context, callback) => {
    try {
        const { cDownloadPath } = JSON.parse(event.body);
        const fileExtension = cDownloadPath.split('.').pop(); // Extract file extension
        const contentType = mime.lookup(fileExtension) || 'application/octet-stream'; // Get MIME type
        const oFileStream = await _oCommonCls.FunDCT_DownloadS3File(cDownloadPath);
        if (oFileStream) {
            return {
                statusCode: 200,
                headers: {
                    'Content-Type': contentType,
                    'Content-Disposition': `attachment; filename="${cDownloadPath.split('/').pop()}"`,
                },
                body: oFileStream,
                isBase64Encoded: true,
            };
        }
        return {
            statusCode: 404,
            body: JSON.stringify({ message: 'File not found' }),
        };
    } catch (err) {
        return await _oCommonCls.FunDCT_Handleresponse('Error', 'APPLICATION', 'SERVER_ERROR', HttpStatusCodes.BAD_REQUEST, err);
    }
};

module.exports.listExportHandler = async (event, context, callback) => {
    let response;
    try {
        context.callbackWaitsForEmptyEventLoop = false;
        await oConnectDB();
        _oCommonCls.FunDCT_ApiRequest(event)
        response = await commonUtilityService.listExport(event);
        callback(null, response);

    } catch (error) {
        response = {
            statusCode: HttpStatusCodes.INTERNAL_SERVER_ERROR,
            body: JSON.stringify({ error: error.message }),
        };
        callback(null, response);
    }

};

module.exports.sendInstructionHandler = async (event, context, callback) => {
    let response;
    try {
        context.callbackWaitsForEmptyEventLoop = false;
        await oConnectDB();
        const bodyBuffer = Buffer.from(event.body, event.isBase64Encoded ? 'base64' : 'utf8');
        // Parse multipart/form-data
        const parsedData = await parser.parse({
            headers: event.headers,
            body: bodyBuffer.toString('binary')
        });

        // Convert fields to normal object
        const formData: any = { ...parsedData };
        response = await commonUtilityService.sendInstruction(formData);
        callback(null, response);

    } catch (error) {
        response = {
            statusCode: HttpStatusCodes.INTERNAL_SERVER_ERROR,
            body: JSON.stringify({ error: error.message }),
        };
        callback(null, response);
    }
};