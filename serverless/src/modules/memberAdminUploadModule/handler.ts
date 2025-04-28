import oConnectDB from "../../config/database";
import { MemberUploadService } from "../memberUploadModule/memberUploadService";
import HttpStatusCodes from "http-status-codes";
import { MemberAdminUploadService } from "./MemberAdminUploadService";
const parser = require('lambda-multipart-parser')
const dbPromise = oConnectDB();

const memberAdminUploadService = new MemberAdminUploadService()
module.exports.memberUploadTemplateHandler = async (event, context, callback) => {
    context.callbackWaitsForEmptyEventLoop = false;
    let response;
    try {
        await dbPromise;
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
        return await memberAdminUploadService.memberAdminUploadTemplate(formData, event);
    } catch (error) {
        response = {
            statusCode: HttpStatusCodes.INTERNAL_SERVER_ERROR,
            body: JSON.stringify({ error: error.message }),
        };
        callback(null, response);
    }
};