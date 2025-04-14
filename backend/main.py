from fastapi import FastAPI, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from .database import SessionLocal
from .crud import get_all_questions, create_question

app = FastAPI()

class QuestionCreate(BaseModel):
    content: str
    answer: str

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.get("/questions")
def read_questions(db: Session = Depends(get_db)):
    return get_all_questions(db)

@app.post("/questions")
def add_question(q: QuestionCreate, db: Session = Depends(get_db)):
    return create_question(db, q.content, q.answer)