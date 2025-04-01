/**
 * Payload Object to be signed and verified by JWT. Used by the auth middleware to pass data to the request by token signing (jwt.sign) and token verification (jwt.verify).
 * @param _id:string
 */
// type payload = { userId: string };

type payload = { 
    userId: string,
    _id: string,
    iAccessTypeID: string,
    cEmail: string,
    cAvatar: string,
    cName: string,
    cUsername: string,
    cCompanyname: string,
    cAddress: string,
    cCity: string,
    cPostalcode: string,
    cState: string,
    cPhone: string,
    cFax: string };

export default payload;
