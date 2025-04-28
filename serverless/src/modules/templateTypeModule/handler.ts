// import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import oConnectDB from "../../config/database";
import HttpStatusCodes from "http-status-codes";
import { check, validationResult } from "express-validator";
import { TemplateTypeService } from "./templateTypeService";
const dbPromise = oConnectDB();
const templateTypeServices = new TemplateTypeService();

module.exports.templateListHandler = async (event, context, callback) => {
  context.callbackWaitsForEmptyEventLoop = false;
  let response;
  try {
   await dbPromise;
    check("iOffset", "Offset is required").not().isEmpty();
    check("iLimit", "Offset is required").not().isEmpty();
    const errors = validationResult(event);
    if (!errors.isEmpty()) {
      callback(null, event
        .status(HttpStatusCodes.BAD_REQUEST)
        .json({ errors: errors.array() }))
    }
    return await templateTypeServices.templateTypeListing(event);
  } catch (error) {
    response = {
      statusCode: HttpStatusCodes.INTERNAL_SERVER_ERROR,
      body: JSON.stringify({ error: error.message }),
    };
    callback(null, response);
  }
};

module.exports.addTemplateHandler = async (event, context, callback) => {
  context.callbackWaitsForEmptyEventLoop = false;
  let response;
  try {
   await dbPromise;
    check("cTemplateType", "cTemplateType is required").not().isEmpty();
    check("cTemplateTypeDesc", "cTemplateTypeDesc is required").not().isEmpty();
    check("iStatusID", "Status is required").not().isEmpty();
    check("preFillData", "preFillData is required").not().isEmpty();
    const errors = validationResult(event);
    if (!errors.isEmpty()) {
      callback(null, event
        .status(HttpStatusCodes.BAD_REQUEST)
        .json({ errors: errors.array() }))
    }
    return await templateTypeServices.templateTypeAdd(event);
  } catch (error) {
    response = {
      statusCode: HttpStatusCodes.INTERNAL_SERVER_ERROR,
      body: JSON.stringify({ error: error.message }),
    };
    callback(null, response);
  }
};

module.exports.updateTemplateHandler = async (event, context, callback) => {
  context.callbackWaitsForEmptyEventLoop = false;
  let response;
  try {
   await dbPromise;

    const errors = validationResult(event);
    if (!errors.isEmpty()) {
      callback(null, event
        .status(HttpStatusCodes.BAD_REQUEST)
        .json({ errors: errors.array() }))
    }
    return await templateTypeServices.templateTypeUpdate(event);
  } catch (error) {
    response = {
      statusCode: HttpStatusCodes.INTERNAL_SERVER_ERROR,
      body: JSON.stringify({ error: error.message }),
    };
    callback(null, response);
  }
};

module.exports.deleteTemplateHandler = async (event, context, callback) => {
  context.callbackWaitsForEmptyEventLoop = false;
  let response;
  try {
   await dbPromise;
    return await templateTypeServices.templateTypeDelete(event);
  } catch (error) {
    response = {
      statusCode: HttpStatusCodes.INTERNAL_SERVER_ERROR,
      body: JSON.stringify({ error: error.message }),
    };
    callback(null, response);
  }
};