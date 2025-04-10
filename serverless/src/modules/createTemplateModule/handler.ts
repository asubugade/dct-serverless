import oConnectDB from "../../config/database";
import HttpStatusCodes from "http-status-codes";
import { check, validationResult } from "express-validator";
import { CreateTemplateService } from "./createTemplateService";

const parser = require('lambda-multipart-parser')

const createTemplateService = new CreateTemplateService()

module.exports.excelToJsonHandler = async (event, context, callback) => {

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
    // Check if parsedData has files and fields
    if (event.file) {
      formData.files = [event.file]; // Handle files if needed
    }
    response = await createTemplateService.excelToJSON(event, formData);
    callback(null, response);

  } catch (error) {
    response = {
      statusCode: HttpStatusCodes.INTERNAL_SERVER_ERROR,
      body: JSON.stringify({ error: error.message }),
    };
    callback(null, response);
  }
};

module.exports.addTemplateHandler = async (event, context, callback) => {
  let response;
  try {
    context.callbackWaitsForEmptyEventLoop = false;
    await oConnectDB();
    const errors = validationResult(event);
    if (!errors.isEmpty()) {
      callback(null, event
        .status(HttpStatusCodes.BAD_REQUEST)
        .json({ errors: errors.array() }))
    }

    response = await createTemplateService.saveTemplateDocument(event);
    callback(null, response);

  } catch (error) {
    response = {
      statusCode: HttpStatusCodes.INTERNAL_SERVER_ERROR,
      body: JSON.stringify({ error: error.message }),
    };
    callback(null, response);
  }
};

module.exports.deleteTemplateHandler = async (event, context, callback) => {
  let response;
  try {
      context.callbackWaitsForEmptyEventLoop = false;
      await oConnectDB();
      response = await createTemplateService.templateDelete(event);
      callback(null, response);

  } catch (error) {
      response = {
          statusCode: HttpStatusCodes.INTERNAL_SERVER_ERROR,
          body: JSON.stringify({ error: error.message }),
      };
      callback(null, response);
  }
};