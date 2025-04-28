import mongoose, { ConnectOptions } from 'mongoose';
import { GetSecretValueCommand, SecretsManagerClient } from '@aws-sdk/client-secrets-manager';
import { ClsDCT_ConfigIntigrations } from './config';

let cachedDb: typeof mongoose | null = null;

const oConnectDB = async (): Promise<typeof mongoose> => {
  if (cachedDb && mongoose.connection.readyState === 1) {
    
    return cachedDb;
  }

  try {
    const oConfIntigration = new ClsDCT_ConfigIntigrations();
    const oOptions: ConnectOptions = {
      serverSelectionTimeoutMS: 3000,
    socketTimeoutMS: 45000,
    maxPoolSize: 5,
    dbName: process.env.DB_NAME, // Safe to include again for clarity
    };

    if (process.env.NODE_ENV === 'Server') {
      const client = new SecretsManagerClient({ region: process.env.AWS_REGION });
      const response: any = await client.send(
        new GetSecretValueCommand({ SecretId: process.env.SECRET_NAME })
      );

      if (response?.SecretString) {
        const data = JSON.parse(response.SecretString);
        oConfIntigration.cDBName = data.cDBName;
        oConfIntigration.cUserNameDB = data.cUserNameDB;
        oConfIntigration.cPasswordDB = data.cPasswordDB;
        oConfIntigration.cHost = data.cHost;
      }
    }

    const cMongodbURI = `mongodb://${oConfIntigration.cUserNameDB}:${oConfIntigration.cPasswordDB}@${oConfIntigration.cHost}/${oConfIntigration.cDBName}`;
    cachedDb = await mongoose.connect(cMongodbURI, oOptions);
    console.log("✅ MongoDB connected");

    return cachedDb;
  } catch (err) {
    console.error("❌ MongoDB connection error:", err.message);
    throw err;
  }
};

export default oConnectDB;
