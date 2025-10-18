from fastapi import FastAPI, Path, HTTPException, Query
import json

app=FastAPI()
# read data from json file
def read_data():
    with open(r'C:\Users\Burhan Zulfiqar\Music\FastAPI_repo\data.json') as f:
        patient_data=json.load(f)
    return patient_data

# Home screen route

@app.get('/')
def Home():
    return {'message':'Welcome to FastAPI'}

# Blog route

@app.get('/blog')
def blog():
    return {'message':'Soon upload the blog'}

# All data fetch route

@app.get('/data')
def get_data():
    return read_data()

# Specific patient data fetch route with some validattion also use path parameter

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

# sort data by using query parameter according to specific feild

@app.get('/sort')
def sort_data(
    sort_by: str = Query(..., description="The field by which to sort the data", example="age"),
    order: str = Query("asc", description="The order in which to sort the data", example="asc")
):
    data = read_data()
    if sort_by not in data[0]:
        raise HTTPException(status_code=400, detail=f"Invalid sort field: {sort_by}")
    reverse = True if order == "desc" else False
    sorted_data = sorted(data, key=lambda x: x[sort_by], reverse=reverse)
    return sorted_data
