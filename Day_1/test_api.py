from fastapi import FastAPI

app=FastAPI()

@app.get("/")
def hello():
    return {'meassge':'Hello this is my first APi test in Fast API'}

@app.get('/about')
def about():
    return {'message':'My name is Burhan and is this my first APi project in Fast API'}
