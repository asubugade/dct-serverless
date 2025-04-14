import oConnectDB from "../../config/database";
import HttpStatusCodes from "http-status-codes";
import { check, validationResult } from "express-validator";
import { MemberUploadService } from "./memberUploadService";
import { ClsDCT_Common } from "../../commonModule/Class.common";
const parser = require('lambda-multipart-parser')


const _oCommonCls = new ClsDCT_Common();
const memberUploadService = new MemberUploadService()

module.exports.listHandler = async (event, context, callback) => {
    let response;
    try {
        context.callbackWaitsForEmptyEventLoop = false;
        await oConnectDB();
        check("iOffset", "Offset is required").not().isEmpty();
        check("iLimit", "Offset is required").not().isEmpty();
        const errors = validationResult(event);
        if (!errors.isEmpty()) {
            callback(null, event
                .status(HttpStatusCodes.BAD_REQUEST)
                .json({ errors: errors.array() }))
        }

        response = await memberUploadService.memberUploadLogListing(event);
        callback(null, response);

    } catch (error) {
        response = {
            statusCode: HttpStatusCodes.INTERNAL_SERVER_ERROR,
            body: JSON.stringify({ error: error.message }),
        };
        callback(null, response);
    }
};

module.exports.downloadTemplateHandler = async (event, context, callback) => {
    let response;
    try {
        context.callbackWaitsForEmptyEventLoop = false;
        await oConnectDB();
        response = await memberUploadService.downloadTemplate(event);
        callback(null, response);

    } catch (error) {
        response = {
            statusCode: HttpStatusCodes.INTERNAL_SERVER_ERROR,
            body: JSON.stringify({ error: error.message }),
        };
        callback(null, response);
    }
};

module.exports.deleteMemberUploadLogHandler = async (event, context, callback) => {
    let response;
    try {
        context.callbackWaitsForEmptyEventLoop = false;
        await oConnectDB();
        const response = await memberUploadService.memberUploadLogDelete(event);
        callback(null, response)

    } catch (error) {
        response = {
            statusCode: HttpStatusCodes.INTERNAL_SERVER_ERROR,
            body: JSON.stringify({ error: error.message }),
        };
        callback(null, response)
    }
};

module.exports.memberUploadTemplateHandler = async (event, context, callback) => {
    let response;
    try {
        context.callbackWaitsForEmptyEventLoop = false;
        await oConnectDB();
        const bodyBuffer = Buffer.from(event.body, event.isBase64Encoded ? 'base64' : 'utf8');

        const parsedData = await parser.parse({
            headers: event.headers,
            body: bodyBuffer.toString('binary')
        });

        let formData: any = { ...parsedData };
        delete formData.files;
        parsedData.files.forEach(file => {
            if (file.fieldname === 'aTemplateFileInfo') {
                formData.aTemplateFileInfo = file;
            } else if (file.fieldname === 'cAdditionalFiles') {
                if (!formData.cAdditionalFiles) {
                    formData.cAdditionalFiles = [];
                }
                formData.cAdditionalFiles.push(file);
            }
        });
        return await memberUploadService.memberUploadTemplate(formData, event);
    } catch (error) {
        response = {
            statusCode: HttpStatusCodes.INTERNAL_SERVER_ERROR,
            body: JSON.stringify({ error: error.message }),
        };
        callback(null, response);
    }
};