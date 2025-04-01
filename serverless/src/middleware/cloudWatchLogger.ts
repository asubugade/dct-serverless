import { CloudWatchLogsClient, CreateLogGroupCommand, PutLogEventsCommand, GetLogEventsCommand,DescribeLogStreamsCommand,CreateLogStreamCommand } from "@aws-sdk/client-cloudwatch-logs";
import { ClsDCT_ConfigIntigrations } from "../config/config";
import moment from 'moment';
import { GetSecretValueCommand, SecretsManagerClient } from "@aws-sdk/client-secrets-manager";
require('dotenv').config();

export class cloudWatchClass {
  protected cConfigIntigrations = new ClsDCT_ConfigIntigrations();
  protected CloudWatchLogsClient = new CloudWatchLogsClient({})
  private group = this.cConfigIntigrations.CLOUDWATCH_GROUP;
  public stream = moment().format('YYYY-MM-DD')


constructor(){
  this.FunDCT_secretConfig();
}

private async FunDCT_secretConfig(){
  if (process.env.NODE_ENV == "Server") {
    const client = new SecretsManagerClient({ region: process.env.AWS_REGION });
    const response = await client.send(
      new GetSecretValueCommand({
      SecretId: process.env.SECRET_NAME,
      }),
    );
    if (response) {
      const dataString = JSON.parse(response.SecretString);
      // this.cConfigIntigrations.CLOUDWATCH_REGION = dataString.CLOUDWATCH_REGION;
      // this.cConfigIntigrations.CLOUDWATCH_ACCESS_KEY = dataString.CLOUDWATCH_ACCESS_KEY;
      // this.cConfigIntigrations.CLOUDWATCH_SECRET_ACCESS_KEY = dataString.CLOUDWATCH_SECRET_ACCESS_KEY;
      // this.cConfigIntigrations.CLOUDWATCH_GROUP = dataString.CLOUDWATCH_GROUP;
      
      this.group = dataString.CLOUDWATCH_GROUP;
      const config = {
        region:dataString.CLOUDWATCH_REGION,
        credentials :{
          accessKeyId: dataString.CLOUDWATCH_ACCESS_KEY,
          secretAccessKey: dataString.CLOUDWATCH_SECRET_ACCESS_KEY}
      }
      this.CloudWatchLogsClient = new CloudWatchLogsClient(config)
    }
  }
  else if (process.env.NODE_ENV == "Local"){
    this.group = this.cConfigIntigrations.CLOUDWATCH_GROUP;
    const config = {
      region:this.cConfigIntigrations.CLOUDWATCH_REGION,
      credentials :{
        accessKeyId: this.cConfigIntigrations.CLOUDWATCH_ACCESS_KEY,
        secretAccessKey: this.cConfigIntigrations.CLOUDWATCH_SECRET_ACCESS_KEY}
    }
    this.CloudWatchLogsClient = new CloudWatchLogsClient(config)
}
}
  public setStream(streamName:string){
    this.stream = moment().format('YYYY/MM/DD')
    this.stream = this.stream + '/' + streamName
  }
  public log(mesage){
    
    this.logEvent(mesage,this.stream)
    if(this.cConfigIntigrations.cNodeEnv == 'Local'){
      // console.log(mesage)      
    }else{
    this.logEvent(mesage,this.stream)}

  }
  public info(mesage){
    this.logEvent(mesage,this.stream)
    if(this.cConfigIntigrations.cNodeEnv == 'Local'){
      // console.info(mesage)      
    }else{
    this.logEvent(mesage,this.stream)}

  }
  public error(mesage){
    this.logEvent(mesage,this.stream)
    if(this.cConfigIntigrations.cNodeEnv == 'Local'){
      // console.error(mesage)      
    }else{
    this.logEvent(mesage,this.stream)}

  }
  async createLogEventBody(user, type, event, request, res){
    try {
      let response = {
          "username": user.cUsername,
          "userdetails":{
             "userId": user.iUserID,
             "usename": user.cUsername,
             "email": user.cEmail,
             "usertype": user.role,
             "appType": user.cApptype,
             "requestType": type
           },
           "currentDate":moment().format('YYYY-MM-DD'),
           "eventName": event,
           "eventRequest": request,
          //  "eventResponse": JSON.parse(res)?.status,
           "ResponseData": res
         }
      return response
    } catch (err) {
      console.log("Cloud watch Log ",err);
      return 
    }
  }
  async logEvent(body, stream){
    let putLogs;
    await this.FunDCT_secretConfig();
    let token = await this.getSequenceToken(stream, this.group);
    let params = {
      logEvents: [ 
        {
          message: JSON.stringify(body), 
          timestamp: new Date().getTime()
        },
      ],
      logGroupName: this.group,
      logStreamName: stream, 
      sequenceToken : token
    };
    
    try {
      putLogs = await this.putLogsEvent(params);
      return putLogs
    } catch (error) {
      if(error.code == 'InvalidSequenceTokenException'){
        params.sequenceToken = error.message.split(":")[1].trim("");
        putLogs = await this.putLogsEvent(params);
        return putLogs
      } else {
        console.log('Put log Event',error )
        return error
      }
    }
  }

  async putLogsEvent(params){
    return new Promise(async (resolve, reject)=>{
      try {
        let commond = new PutLogEventsCommand(params);
        let data = await this.CloudWatchLogsClient.send(commond)
        resolve(data)
          
      } catch (error) {
        reject(error)
        
      }
   
    })
  }

  async getSequenceToken(stream, group){
    let config = {
      "logGroupName": group,
      "logStreamNamePrefix": stream
     }
     try {
      const commond = new DescribeLogStreamsCommand(config);
      
      let response = await this.CloudWatchLogsClient.send(commond)
      if(response.logStreams.length == 0 || response.logStreams.some(e=> e.logStreamName === stream) == false){
        await this.createLogStream(group, stream);
        return null;
      } else {
        return response.logStreams.find(e => e.logStreamName.toUpperCase() == stream.toUpperCase()).uploadSequenceToken;
      }
     } catch (error) {
      
      console.log('Sequesnce Token Cloud Wath',error.name);
      console.log(error)

      if(error && error.name == 'ResourceNotFoundException'){
        await this.createLogGroup(group);
        await this.getSequenceToken(stream, group);
      }
     }


  }

  async getLogs(params){
    let config = {
      logGroupName: params.logGroupName, 
      logStreamName: params.logStreamName,
      startFromHead: false,
   }
   try {
    const conmond = new GetLogEventsCommand(config)
    let res = await this.CloudWatchLogsClient.send(conmond)
    return res
     
   } catch (error) {
    
    return error
   }

  }

  createLogStream(group, stream) {
    let config = {
      logGroupName: group, 
      logStreamName: stream
   }
  try {
    const commond = new CreateLogStreamCommand(config);
    let res = this.CloudWatchLogsClient.send(commond)
    return res
  } catch (error) {
    console.log('create stream',error );
    return 
  }

  }

  async createLogGroup(group) {
    let config = {
      "logGroupName": group
      }
      try {
        const commond = new CreateLogGroupCommand(config);
        let res = await this.CloudWatchLogsClient.send(commond)
        console.log('Log created Successfully ')
      } catch (error) {
        console.log('Error Log created Successfully ')
        
  }

  }


  async getLogStreams() {
    let params = {
      logGroupName: this.group, /* required */
      // descending: true || false,
      // limit: 'NUMBER_VALUE',
      //  logStreamNames: [this.stream],
      // nextToken: 'STRING_VALUE',
      // orderBy: 'LastEventTime'
    };
    try {
      const commond = new DescribeLogStreamsCommand(params);
      let response = await this.CloudWatchLogsClient.send(commond)
        return response
      
     } catch (error) {
      console.log(error, error.stack);
     }


  }

}