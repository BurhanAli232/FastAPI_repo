from fastapi import FastAPI, Path, HTTPException, Query
from fastapi.responses import HTMLResponse
import json

app = FastAPI()

# --- Best Practice Note ---
# It's better to use a relative path for your data file.
# This makes your project portable. Place `data.json` in the
# same folder as this Python script.
DATA_FILE_PATH = r'C:\Users\Burhan Zulfiqar\Music\FastAPI_repo\data.json'

# read data from json file
def read_data():
    try:
        with open(DATA_FILE_PATH, 'r') as f:
            patient_data = json.load(f)
        return patient_data
    except FileNotFoundError:
        # If the file doesn't exist, return an empty list
        # to prevent the app from crashing.
        return []
    except json.JSONDecodeError:
        # Handle cases where the JSON is invalid
        return []

# --- MODIFIED ROUTE ---
# This route will now serve your index.html file as the main page.
@app.get('/', response_class=HTMLResponse)
def root():
    try:
        with open('index.html', 'r') as f:
            html_content = f.read()
        return HTMLResponse(content=html_content, status_code=200)
    except FileNotFoundError:
        return HTMLResponse(content="<h1>Error: index.html not found</h1><p>Please make sure index.html is in the same folder as your Python script.</p>", status_code=404)


# Blog route
@app.get('/blog')
def blog():
    return {'message': 'Soon upload the blog'}

# All data fetch route
@app.get('/data')
def get_data():
    return read_data()

# Specific patient data fetch route with some validation also use path parameter
@app.get('/patient/{id}')
def view_patient(id: str = Path(...,
                                Name="Patient ID",
                                description="The ID of the patient you want to view",
                                # Removed 'message' as it's not a valid Path parameter here.
                                example="A001",
                                min_length=4,
                                max_length=4,
                                regex="^[A-Z][0-9]{3}$"
                                )):
    patient = read_data()
    for i in patient:
        if i["id"] == id:
            return i
    raise HTTPException(status_code=404, detail="You entered a wrong ID. Please enter a valid ID and try again.")

# sort data by using query parameter according to a specific field
@app.get('/sort')
def sort_data(
    sort_by: str = Query(..., description="The field by which to sort the data", example="age"),
    order: str = Query("asc", description="The order in which to sort the data", example="asc", regex="^(asc|desc)$")
):
    data = read_data()
    if not data:
         return []
         
    if sort_by not in data[0]:
        raise HTTPException(status_code=400, detail=f"Invalid sort field: {sort_by}")

    reverse = True if order == "desc" else False
    
    # Handle sorting numbers vs strings gracefully
    try:
        sorted_data = sorted(data, key=lambda x: float(x.get(sort_by, 0)), reverse=reverse)
    except (ValueError, TypeError):
        sorted_data = sorted(data, key=lambda x: str(x.get(sort_by, '')), reverse=reverse)
        
    return sorted_data
