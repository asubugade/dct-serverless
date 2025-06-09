import pymongo
import subprocess
import time
from pathlib import Path
import sys
path = str(Path(Path(__file__).parent.absolute()).parent.absolute())
sys.path.insert(0, path)
from pyconfig import loadConfig
from pyconfig.model_common import model_common_Cls
import psutil
from concurrent.futures import ThreadPoolExecutor
import signal
from pathlib import Path
executor = None
model_common_Cls = model_common_Cls()
pythonscriptpath = str(Path(__file__).parent) + "\\"
processs = {
    'TemplateUpload': f'{pythonscriptpath}ValidateTemplate.py',
    'Consolidate': f'{pythonscriptpath}ConsolidateTemplate.py',
    'MemberSubConsolidate': f'{pythonscriptpath}MemberConsolidate.py'
    }
def fileprocess(iTemplateTypeid, cProcessType,lid):
        if has_sufficient_memory():
            # Extract necessary fields from the document
            
            # Prepare the command to execute the Python script
            laneitem = model_common_Cls.get_LaneSchedule(iTemplateTypeid)
            print(f'Executing script for {laneitem}')
            scriptPath = processs.get(cProcessType)
            if scriptPath and laneitem:
                jDump = laneitem.get('jDump')
                id_sch = str(laneitem.get('_id'))
                cmdList = ['Python' , scriptPath, id_sch]
                cmd = ' '.join(cmdList)
                print(f"Command to execute: {cmd}")
                # model_common_Cls.delete_LaneSchedulebyID(id_sch)
                model_common_Cls.update_LaneIncremental(lid)
                # Run the external Python script with parameters
                try:
                    subprocess.run(cmd, start_new_session=True,shell=True,text=True,capture_output=False)
                    model_common_Cls.update_LaneDecremental(lid)
                    print(f"Executed {scriptPath} with schedule id: {id_sch}")
                    
                except subprocess.CalledProcessError as e:
                    print(f"Error executing script: {e}")
    

    
def check_and_execute():
    lane_CodeList = model_common_Cls.get_LaneTodo()
    threshold = 3
    for doc in lane_CodeList:
        process_type = doc.get('cProcessingType', None)
        lid = doc.get('_id')
        todo_value = doc.get('iToDo', 0)
        iActive_value = doc.get('iActive', 0)
        iTemplateID = doc.get('iTemplateTypeID')

        if iActive_value < threshold:
            for i in range(0,1):
                # with ThreadPoolExecutor(max_workers=threshold) as executor:
                #     executor.submit(fileprocess,)
                fileprocess(iTemplateID,process_type,lid)



def has_sufficient_memory(min_required_memory_mb=2000):
    """
    Check if the system has enough available memory in MB.
    """
    memory = psutil.virtual_memory()
    available_memory_mb = memory.available / (1024 * 1024)  # Convert from bytes to MB
    print(f"Available memory: {available_memory_mb} MB")
    
    if available_memory_mb >= min_required_memory_mb:
        return True
    else:
        print(f"Insufficient memory: {available_memory_mb} MB available, {min_required_memory_mb} MB required.")
        return False
def signal_handler(sig, frame):
        sys.exit(0)
def monitor():
    
    check_and_execute()

def localRun():
    global executor
    
    signal.signal(signal.SIGINT, signal_handler)

    while True:
        check_and_execute()
        time.sleep(30)  # Wait for 1 minute before checking again
if __name__ == '__main__':
    monitor()
    # localRun()
