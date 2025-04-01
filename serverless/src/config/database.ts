import { GetSecretValueCommand, SecretsManagerClient } from '@aws-sdk/client-secrets-manager';
import { ClsDCT_ConfigIntigrations } from './config';
import { ConnectOptions, connect } from "mongoose";

let isConnected; // Variable to hold the connection status

const oConnectDB = async () => {
  if (isConnected) {
    return; // If already connected, return
}
  try {
    let oConfIntigration = new ClsDCT_ConfigIntigrations();    
    const oOptions: ConnectOptions = {
    };
    if (process.env.NODE_ENV == "Server") {
      const client = new SecretsManagerClient({ region: process.env.AWS_REGION });
      const response:any = await client.send(
        new GetSecretValueCommand({
        SecretId: process.env.SECRET_NAME,
        }),
      );
      if (response) {
        const dataString = JSON.parse(response.SecretString);
        oConfIntigration.cDBName = dataString.cDBName;
        oConfIntigration.cUserNameDB = dataString.cUserNameDB;
        oConfIntigration.cPasswordDB = dataString.cPasswordDB;
        oConfIntigration.cHost = dataString.cHost;
      }
    }
    
    
    let cMongodbURI = 'mongodb://';
    if (oConfIntigration.cNodeEnv != 'Local') {
      cMongodbURI = `${cMongodbURI}${oConfIntigration.cUserNameDB}:${oConfIntigration.cPasswordDB}@${oConfIntigration.cHost}/${oConfIntigration.cDBName}`;
      await connect(cMongodbURI, oOptions);
      isConnected = true;
    }
    else{
      cMongodbURI = `${cMongodbURI}${oConfIntigration.cUserNameDB}:${oConfIntigration.cPasswordDB}@${oConfIntigration.cHost}/${oConfIntigration.cDBName}`;
      await connect(cMongodbURI, oOptions);
      isConnected = true;
    }
  } catch (err) {
    console.error(err.message);
  }
};

export default oConnectDB;