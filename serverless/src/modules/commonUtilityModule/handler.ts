import { ClsDCT_Common } from "../../commonModule/Class.common";
import HttpStatusCodes from "http-status-codes";


const _oCommonCls = new ClsDCT_Common();

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
        await _oCommonCls.FunDCT_Handleresponse('Error', 'APPLICATION', 'SERVER_ERROR', HttpStatusCodes.BAD_REQUEST, err);
    }
};