import HttpStatusCodes from "http-status-codes";
import { GenUserService } from "./userService";
import oConnectDB from "../../config/database";
import { check, validationResult } from "express-validator";
import { checkUserEmail, checkUserEmailUpdate, checkUserName, checkUserNameUpdate } from "./usersDal";


const dbPromise = oConnectDB();
const parser = require('lambda-multipart-parser');
const genUserService = new GenUserService();


module.exports.listHandler = async (event, context, callback) => {
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

    let response = await genUserService.userListing(event);
    return response;

  } catch (error) {
    response = {
      statusCode: HttpStatusCodes.INTERNAL_SERVER_ERROR,
      body: JSON.stringify({ error: error.message }),
    };
    callback(null, response)
  }
};


module.exports.profileHandler = async (event, context, callback) => {
  context.callbackWaitsForEmptyEventLoop = false;

  let response;
  try {
   await dbPromise;
    const userProfile = await genUserService.profile(event);
    callback(null, userProfile)

  } catch (error) {
    response = {
      statusCode: HttpStatusCodes.INTERNAL_SERVER_ERROR,
      body: JSON.stringify({ error: error.message }),
    };
    callback(null, response)
  }
};


module.exports.deleteProfileHandler = async (event, context, callback) => {
  context.callbackWaitsForEmptyEventLoop = false;

  let response;
  try {
   await dbPromise;
    const response = await genUserService.userDelete(event);
    callback(null, response)

  } catch (error) {
    response = {
      statusCode: HttpStatusCodes.INTERNAL_SERVER_ERROR,
      body: JSON.stringify({ error: error.message }),
    };
    callback(null, response)
  }
};


module.exports.addUserHandler = async (req, context, callback) => {
    context.callbackWaitsForEmptyEventLoop = false;
    let response;
    try {

     await dbPromise;
      // Decode base64 body if needed
      const bodyBuffer = Buffer.from(req.body, req.isBase64Encoded ? 'base64' : 'utf8');
      
      // Parse multipart/form-data
      const parsedData = await parser.parse({
        headers: req.headers,
        body: bodyBuffer.toString('binary')
      });

      // Convert fields to normal object
      const formData:any = { ...parsedData};

      // Check if parsedData has files and fields
      if (req.file) {
        formData.files = [req.file]; // Handle files if needed
      }

      // Handle array fields
      if (formData.cTemplateType) {
        formData.cTemplateType = JSON.parse(formData.cTemplateType);
      }

      // Rest of your validation logic using formData
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return callback(null, {
          statusCode: HttpStatusCodes.BAD_REQUEST,
          body: JSON.stringify({ errors: errors.array() })
        });
      }

      const bUserName = await checkUserName(formData.cUsername);
      const bEmail = await checkUserEmail(formData.cEmail);

      if (bUserName) {
        return await genUserService.FunDCT_Handleresponse('Error', 'USER', 'DUPLICATE_USERNAME', HttpStatusCodes.BAD_REQUEST, 'Username exists', req);
      }
      if (bEmail) {
        return await genUserService.FunDCT_Handleresponse('Error', 'USER', 'DUPLICATE_EMAIL', HttpStatusCodes.BAD_REQUEST, 'EMAIL ID Already exists', req);
      }

       return await genUserService.userAddUpdate(req ,formData);
    

    } catch (error) {
      console.error("Error:", error);
      response = {
        statusCode: HttpStatusCodes.INTERNAL_SERVER_ERROR,
        body: JSON.stringify({ error: error.message })
      };
      callback(null, response);
    }

};


module.exports.updateUserHandler = async (req, context, callback) => {
    context.callbackWaitsForEmptyEventLoop = false;
    let response;
    try {

     await dbPromise;
      // Decode base64 body if needed
      const bodyBuffer = Buffer.from(req.body, req.isBase64Encoded ? 'base64' : 'utf8');
      
      // Parse multipart/form-data
      const parsedData = await parser.parse({
        headers: req.headers,
        body: bodyBuffer.toString('binary')
      });

      // Convert fields to normal object
      const formData:any = { ...parsedData};

      // Check if parsedData has files and fields
      if (req.file) {
        formData.files = [req.file]; // Handle files if needed
      }

      // Handle array fields
      if (formData.cTemplateType) {
        formData.cTemplateType = JSON.parse(formData.cTemplateType);
      }

      // Rest of your validation logic using formData
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return callback(null, {
          statusCode: HttpStatusCodes.BAD_REQUEST,
          body: JSON.stringify({ errors: errors.array() })
        });
      }
      
      const bUserName = await checkUserNameUpdate(formData);
      const bEmail = await checkUserEmailUpdate(formData);

      if (bUserName) {
        return await genUserService.FunDCT_Handleresponse('Error', 'USER', 'DUPLICATE_USERNAME', HttpStatusCodes.BAD_REQUEST, 'Username exists', req);
      }
      if (bEmail) {
        return await genUserService.FunDCT_Handleresponse('Error', 'USER', 'DUPLICATE_EMAIL', HttpStatusCodes.BAD_REQUEST, 'EMAIL ID Already exists', req);
      }

       return await genUserService.userUpdate(req ,formData);
    

    } catch (error) {
      console.error("Error:", error);
      response = {
        statusCode: HttpStatusCodes.INTERNAL_SERVER_ERROR,
        body: JSON.stringify({ error: error.message })
      };
      callback(null, response);
    }

};


module.exports.generateOTPHandler = async (event, context, callback) => {
  context.callbackWaitsForEmptyEventLoop = false;

  let response;
  try {
   await dbPromise;
    let response = await genUserService.generateOTP(event);
    return response;

  } catch (error) {
    response = {
      statusCode: HttpStatusCodes.INTERNAL_SERVER_ERROR,
      body: JSON.stringify({ error: error.message }),
    };
    callback(null, response)
  }
};

module.exports.verifyOTPHandler = async (event, context, callback) => {
  context.callbackWaitsForEmptyEventLoop = false;

  let response;
  try {
   await dbPromise;
    let response = await genUserService.verifyOTP(event);
    return response;

  } catch (error) {
    response = {
      statusCode: HttpStatusCodes.INTERNAL_SERVER_ERROR,
      body: JSON.stringify({ error: error.message }),
    };
    callback(null, response)
  }
};


module.exports.forgotPassHandler = async (event, context, callback) => {
  context.callbackWaitsForEmptyEventLoop = false;

  let response;
  try {
   await dbPromise;
    let response = await genUserService.forgotPass(event);
    return response;

  } catch (error) {
    response = {
      statusCode: HttpStatusCodes.INTERNAL_SERVER_ERROR,
      body: JSON.stringify({ error: error.message }),
    };
    callback(null, response)
  }
};


















// module.exports.addUserHandler = async (req, context, callback) => {
// 
//   let response;
// 

//await dbPromise;  try {

//     console.log("event===============================> " , req);
    

//      const body = JSON.parse(req.body);
//     // const errors = validationResult(event);
//     // if (!errors.isEmpty()) {
//     //   return event
//     //     .status(HttpStatusCodes.BAD_REQUEST)
//     //     .json({ errors: errors.array() });
//     // }
//     // let bUserName: boolean = false, bEmail: boolean = false;
//     // bUserName = await checkUserName(body.cUsername);
//     // bEmail = await checkUserEmail(body.cEmail);
//     // if (bUserName) {
//     //  return await genUserService.FunDCT_Handleresponse('Error', 'USER', 'DUPLICATE_USERNAME', HttpStatusCodes.BAD_REQUEST, 'Username exists', event);
//     // }
//     // else if (bEmail) {
//     //   return await genUserService.FunDCT_Handleresponse('Error', 'USER', 'DUPLICATE_EMAIL', HttpStatusCodes.BAD_REQUEST, 'EMAIL ID Already exists', event);
//     // }
//     // else {
//     //   let objRes = await genUserService.userAddUpdate(event);
//     //   if (objRes) {
//     //     return await genUserService.FunDCT_Handleresponse('Success', 'USER', 'USER_INSERTED', 200, objRes, event);
//     //   }
//     // }

//   } catch (error) {
//     response = {
//       statusCode: HttpStatusCodes.INTERNAL_SERVER_ERROR,
//       body: JSON.stringify({ error: error.message }),
//     };
//     callback(null, response)
//   }
// };