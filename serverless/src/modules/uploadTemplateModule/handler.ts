import { check, validationResult } from "express-validator";
import oConnectDB from "../../config/database";
import HttpStatusCodes from "http-status-codes";
import { ClsDCT_Common } from "../../commonModule/Class.common";
import { UploadTemplateService } from "./uploadTemplateService";
const parser = require('lambda-multipart-parser')

const dbPromise = oConnectDB();
const _oCommonCls = new ClsDCT_Common();

const uploadTemplateService = new UploadTemplateService()

module.exports.uploadTemplateHandler = async (event, context, callback) => {
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

    let cToken = event.headers?.['x-wwadct-token'] || event.headers?.['X-WWADCT-TOKEN'];

    if (cToken) {
      await _oCommonCls.FunDCT_SetCurrentUserDetails(cToken);
    }

    _oCommonCls.FunDCT_ApiRequest(event)
    const errors = validationResult(event);
    if (!errors.isEmpty()) {
      callback(null, event
        .status(HttpStatusCodes.BAD_REQUEST)
        .json({ errors: errors.array() }))
    }
    return await uploadTemplateService.uploadTemplate( formData , event);
  } catch (error) {
    response = {
      statusCode: HttpStatusCodes.INTERNAL_SERVER_ERROR,
      body: JSON.stringify({ error: error.message }),
    };
    callback(null, response);
  }
};