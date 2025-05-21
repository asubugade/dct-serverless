// import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { AuthService } from "./authService";
import { validationResult } from "express-validator";
import HttpStatusCodes from "http-status-codes";
import User from "../../models/GenUser";
import oConnectDB from "../../config/database";
import oDotenv from 'dotenv';
const dbPromise = oConnectDB();
const authService = new AuthService();
oDotenv.config({path: '.env'});
module.exports.loginHandler = async (event, context, callback) => {
  context.callbackWaitsForEmptyEventLoop = false;
  let response
  try {
    await dbPromise;
    const body = JSON.parse(event.body || "{}");
    const { cUsername, cPassword } = body;

    if (!cUsername || !cPassword) {
      response = {
        statusCode: HttpStatusCodes.BAD_REQUEST,
        body: JSON.stringify({ error: "Username and Password are required" }),
      };
      callback(null, response)
    }

    const user: any = await authService.validateUser(cUsername, cPassword);
    if (user.error) {
      response = {
        statusCode: HttpStatusCodes.UNAUTHORIZED,
        body: JSON.stringify({
          cModule: "USER",
          cErrorMessage: user.error,
        }),
      };
      callback(null, response)
    }

    const token = await authService.generateToken(user);
    response = {
      statusCode: HttpStatusCodes.OK,
      body: JSON.stringify({ token, user }),
    };
    callback(null, response)

  } catch (error) {
    response = {
      statusCode: HttpStatusCodes.INTERNAL_SERVER_ERROR,
      body: JSON.stringify({ error: "Internal Server Error" }),
    };
    callback(null, response)
  }
};



module.exports.getUserHandler = async (event, context, callback) => {
  let response
  try {
    const userId = event.requestContext.authorizer?.principalId;
    if (!userId) {
      response = {
        statusCode: HttpStatusCodes.UNAUTHORIZED,
        body: JSON.stringify({ error: "Unauthorized" }),
      };
      callback(null, response)
    }

    const user = await User.findById(userId).select("-cPassword");
    response = {
      statusCode: HttpStatusCodes.OK,
      body: JSON.stringify(user),
    };
    callback(null, response)
  } catch (error) {
    response = {
      statusCode: HttpStatusCodes.INTERNAL_SERVER_ERROR,
      body: JSON.stringify({ error: "Internal Server Error" }),
    };
    callback(null, response)
  }
};
