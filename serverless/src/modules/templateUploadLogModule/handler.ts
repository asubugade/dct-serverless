import oConnectDB from "../../config/database";
import HttpStatusCodes from "http-status-codes";
import { check, validationResult } from "express-validator";
import { TemplateUploadLogService } from "./templateUploadLogService";

const templateUploadLogService = new TemplateUploadLogService();

module.exports.listByTemplateTypeHandler = async (event, context, callback) => {
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
    return await templateUploadLogService.templateUploadLogListByTemplateType(event);
  } catch (error) {
    response = {
      statusCode: HttpStatusCodes.INTERNAL_SERVER_ERROR,
      body: JSON.stringify({ error: error.message }),
    };
    callback(null, response);
  }
};

module.exports.templateUploadLogListHandler = async (event, context, callback) => {
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
    return await templateUploadLogService.templateUploadLogList(event);
  } catch (error) {
    response = {
      statusCode: HttpStatusCodes.INTERNAL_SERVER_ERROR,
      body: JSON.stringify({ error: error.message }),
    };
    callback(null, response);
  }
};