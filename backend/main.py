import os
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from typing import List
import mysql.connector
from pydantic import BaseModel
import socket


app = FastAPI(title="Awesome Todo")

MYSQL_HOST = os.getenv('MYSQL_HOST', 'db')
MYSQL_USER = os.getenv('MYSQL_USER', 'root')
MYSQL_PASSWORD = os.getenv('MYSQL_PASSWORD', 'toor')
MYSQL_DATABASE = os.getenv('MYSQL_DATABASE', 'todo')

FASTAPI_PORT = os.getenv('FASTAPI_PORT', '8000')

hostname = socket.gethostname()


conn = mysql.connector.connect(
    host=MYSQL_HOST,
    user=MYSQL_USER,
    password=MYSQL_PASSWORD,
    database=MYSQL_DATABASE
)
cursor = conn.cursor()


class Todo(BaseModel):
    id: int
    content: str

class TodoNoId(BaseModel):
    content: str
    
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.middleware("http")
async def add_server_header(request: Request, call_next):
    response = await call_next(request)
    hostname = socket.gethostname()
    response.headers["X-SERVER"] = hostname
    print(f"{request.method} {request.url}")
    return response

@app.get("/todo", response_model=List[Todo])
def get_todos():
    query = "SELECT id, content FROM todos ORDER BY id DESC"
    cursor.execute(query)
    todos = [Todo(id=row[0], content=row[1]) for row in cursor.fetchall()]
    return todos


@app.post("/todo", response_model=Todo)
def create_todo(model: TodoNoId):
    query = "INSERT INTO todos (content) VALUES (%s)"
    cursor.execute(query, (model.content,))
    conn.commit()
    todo_id = cursor.lastrowid
    return Todo(id=todo_id, content=model.content)


@app.delete("/todo/{id}")
def delete_todo(id: int):
    query = "DELETE FROM todos WHERE id = %s"
    cursor.execute(query, (id,))
    conn.commit()
    if cursor.rowcount == 0:
        raise HTTPException(status_code=404, detail="Todo not found")
    return {"message": "Todo deleted successfully"}


@app.on_event("shutdown")
def shutdown_event():
    cursor.close()
    conn.close()

if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="localhost", port=int(FASTAPI_PORT))
