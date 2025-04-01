import { ClsDCT_ConfigIntigrations } from '../config/config';
import User, { IUser } from "../models/GenUser";
import GenAccessType, { IAccessType } from "../models/GenAccessType";

export class ClsDCT_User {
    public cUserID: string;
    public cEmail: string;
    public cUsername: string;    
    public iAccessTypeID: string;    
    
    public oUserDetails: any;
    public oAccessDetails: any;

    /**
     * Constructor
     */
    constructor() {

    }

    /**
     * To get UserID:_id
     */
    public FunDCT_getUserID() {
        return this.cUserID;
    }

    /**
     * To set UserID:_id
     */
    public FunDCT_setUserID(cUserID:string) {
        this.cUserID = cUserID;
    }



    /**
     * To get Email:cEmail
     */
    public FunDCT_getEmail() {
        return this.cEmail;
    }

    /**
     * To set Email:cEmail
     */
    public FunDCT_setEmail(cEmail:string) {
        this.cEmail = cEmail;
    }


    /**
     * To get Username:cUsername
     */
    public FunDCT_getUsername() {
        return this.cUsername;
    }

    /**
     * To set Username:cUsername
     */
    public FunDCT_setUsername(cUsername:string) {
        this.cUsername = cUsername;
    }



    /**
     * To get Username:cUsername
     */
    public async FunDCT_GetAccessType() {
        return await GenAccessType.find({"_id":this.iAccessTypeID}).select('cAccessCode');
    }


    /**
     * To set Username:cUsername
     */
    public FunDCT_SetAccessType(iAccessTypeID) {
        this.iAccessTypeID = iAccessTypeID
    }



    /**
     * To get current user details based on 
     * userid, email, username
     */
    public FunDCT_getCurrentUserDetails() {
        return this.oUserDetails;
    }

    /**
     * To set user details
     */
    public async FunDCT_setCurrentUserDetails() {
        // const oPayload: Payload | any = oJwt.verify(cToken, cJwtSecret);
        // oReq._id = oPayload._id;
        // let oUserType: IUser = await User.findOne({ _id: oReq._id });                
    }

}
export default new ClsDCT_User();