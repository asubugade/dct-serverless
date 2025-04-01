import { NextFunction, Request, Response } from 'express';
//import {BaseErrorController} from '../controllers/BaseErrorController';

// function errorMiddleware(error: BaseErrorController, request: Request, response: Response, next: NextFunction) {
//   //const status = error.status || 500;
//   const iStatusCode = error.iStatusCode || 500;
//   const message = error.message || 'Something went wrong';

//   response
//     .status(iStatusCode)
//     .send({
//       message,
//       iStatusCode,
//     });
// }

// export default errorMiddleware;