from fastapi import FastAPI
import json

app = FastAPI()

def read_data():
    with open('data.json') as f:
        data = json.load(f)
    return data

@app.get('/')
def home():
    return {'message': 'Welcome to FastAPI'}

@app.get('/about')
def about():
    return {'message': 'This is a FastAPI application to view data from a JSON file'}

@app.get('/data')
def get_data():
    return read_data()
