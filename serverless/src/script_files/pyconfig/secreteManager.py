import sys,os
import boto3
from botocore.exceptions import ClientError
import json
from dotenv import load_dotenv, find_dotenv
from pathlib import Path
import inspect
from YamlConfigLoader import YamlConfigLoader

# cfongi =  str(Path(__file__).resolve().parent.parent) + '\config.yaml'
# yaml = YamlConfigLoader(r"C:\Development\dct-serverless-backend\serverless\config.yml")
path = str(Path(Path(__file__).parent.absolute()).parent.parent.parent.absolute())+ '\config.yml'
yaml = YamlConfigLoader(path)
sys.path.insert(2, path)
file_dir = os.path.dirname(__file__)
sys.path.append(file_dir)
cmd_folder = os.path.realpath(os.path.abspath(os.path.split(inspect.getfile( inspect.currentframe() ))[0]))
if cmd_folder not in sys.path:
    sys.path.insert(0, cmd_folder)

# load_dotenv(find_dotenv())
class secreteManager:
    secrets :dict
    def __init__(self) -> None:
        pass
    def connect(self)-> None:
        session = boto3.session.Session()
        client = session.client(
        service_name='secretsmanager',
        region_name=yaml.getStr('environment','AWS_REGION'),
    )
        try:
            get_secret_value_response = client.get_secret_value(
                SecretId=yaml.getStr('environment','SECRET_NAME')
            )
            self.secrets = get_secret_value_response
        except ClientError as e:
            print(e)
            # with open(yaml.getStr('environment','HOME_DIR')+'secreateManager.txt', 'w') as f:
            #     if e.response['Error']['Code'] == 'ResourceNotFoundException':
            #         f.write("The requested secret " + yaml.getStr('environment','SECRET_NAME') + " was not found")
            #     elif e.response['Error']['Code'] == 'InvalidRequestException':
            #         f.write("The request was invalid due to:", e)
            #     elif e.response['Error']['Code'] == 'InvalidParameterException':
            #         f.write("The request had invalid params:", e)
            #     elif e.response['Error']['Code'] == 'DecryptionFailure':
            #         f.write("The requested secret can't be decrypted using the provided KMS key:", e)
            #     elif e.response['Error']['Code'] == 'InternalServiceError':
            #         f.write("An error occurred on service side:", e)

    def get(self,val):
        if yaml.getStr('environment','NODE_ENV') == 'Local':
            return yaml.getStr('environment',val)
        else:
            self.connect()
            self.secrets =  json.loads(self.secrets.get('SecretString'))
            return self.secrets.get(val)
