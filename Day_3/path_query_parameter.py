from fastapi import FastAPI
import json

app=FastAPI()

def reaad_data():
    with open('FastAPI_repo\data.json') as f:
        data=json.load(f)
    return data

@app.get('/')
def Home():
    return {'message':'Welcome to FastAPI'}

@app.get('/blog')
def blog():
    return {'message':'Soon upload the blog'}

@app.get('/data')
def get_data():
    return reaad_data()
