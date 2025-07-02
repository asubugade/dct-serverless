import { ClsDCT_ConfigIntigrations } from "../../config/config";
import oBcrypt from "bcryptjs";
import oJwt from "jsonwebtoken";
import User, { IUser } from "../../models/GenUser";
import { GetSecretValueCommand, SecretsManagerClient } from "@aws-sdk/client-secrets-manager";
import { ClsDCT_Common } from "../../commonModule/Class.common";

export class AuthService {
    private _oCommonCls = new ClsDCT_Common();

  private cJwtSecret: string;
  private cJwtExpiration: string;
  private cAWSAccessKey: string;
  private cAWSSecretKey: string;

  constructor() {
    this.loadConfig();
  }

  private loadConfig = async () => {
    const oConfIntigration = new ClsDCT_ConfigIntigrations();
    this.cJwtSecret = oConfIntigration.cJwtSecret;
    this.cJwtExpiration = oConfIntigration.cJwtExpiration;

    if (process.env.NODE_ENV === "Server") {
      const client = new SecretsManagerClient({ region: process.env.AWS_REGION });
      const response = await client.send(
        new GetSecretValueCommand({ SecretId: process.env.SECRET_NAME })
      );

      if (response && response.SecretString) {
        const dataString = JSON.parse(response.SecretString);
        this.cAWSAccessKey = dataString.cAWSAccessKey;
        this.cAWSSecretKey = dataString.cAWSSecretKey;
      }
    } else {
      this.cAWSAccessKey = oConfIntigration.cAWSAccessKey;
      this.cAWSSecretKey = oConfIntigration.cAWSSecretKey;
    }
  }

  public validateUser = async (cUsername: string, cPassword: string) => {
    await this._oCommonCls.checkAndSendPasswordExpiryEmails();
    let user = await User.findOne({ cUsername });
    if (!user) {
      return { error: "INVALID_USER" };
    }

    if (!user.passwordHistory || user.passwordHistory.length === 0) {
      return { error: "Invalid PasswordHistory" };
    }

    const isMatch = await oBcrypt.compare(cPassword, user.cPassword);
    if (!isMatch) {
      return { error: "INVALID_PASSWORD" };
    }

    return user;
  }

  public generateToken = async (user: IUser) => {
    const payload = {
      userId: user.id,
      _id: user._id,
      iAccessTypeID: user.iAccessTypeID,
      cEmail: user.cEmail,
      cAvatar: user.cAvatar,
      cName: user.cName,
      cUsername: user.cUsername,
      cCompanyname: user.cCompanyname,
      cAddress: user.cAddress,
      cCity: user.cCity,
      cPostalcode: user.cPostalcode,
      cState: user.cState,
      cPhone: user.cPhone,
      cFax: user.cFax,
    };

    return new Promise<string>((resolve, reject) => {
      oJwt.sign(payload, this.cJwtSecret, { expiresIn: this.cJwtExpiration }, (err, token: string) => {
        if (err) reject(err);
        resolve(token);
      });
    });
  }
}
