from fastapi import FastAPI, Path, HTTPException
import json

app=FastAPI()

def read_data():
    with open(r'C:\Users\Burhan Zulfiqar\Music\FastAPI_repo\data.json') as f:
        patient_data=json.load(f)
    return patient_data

@app.get('/')
def Home():
    return {'message':'Welcome to FastAPI'}

@app.get('/blog')
def blog():
    return {'message':'Soon upload the blog'}

@app.get('/data')
def get_data():
    return read_data()

@app.get('/patient/{id}')
def view_patient(id: str = Path(...,
                                Name="Patient ID",
                                 description="The ID of the patient you want to view",
                                 message="Patient ID must be a string",
                                 example="A001",
                                 min_length=4,
                                 max_length=4,
                                 regex="^[A-Z][0-9]{3}$"

                                 )):
    patient=read_data()
    for i in patient:
        if i["id"]==id:
            return i
    raise HTTPException(status_code=404,detail="You entered wrong ID Please enter a valid id and again try")