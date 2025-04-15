"""
main.py - FastAPI application for serving questions from a database.
"""
from typing import List
from fastapi import FastAPI, Depends, Query
from sqlalchemy.orm import Session


from backend.database import SessionLocal
from backend.crud import get_all_questions, get_all_facts
from backend.models import QuestionResponse

app = FastAPI()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.get("/all_contents", response_model=List[QuestionResponse])
def read_questions(db: Session = Depends(get_db)):
    """
    Fetch all contents from the database.
    """
    return get_all_questions(db)

@app.get("/facts/grouped")
def get_grouped_facts(num: int = Query(..., gt=0), db: Session = Depends(get_db)):
    """
    Group facts by a specified number of rows (num).
    """
    all_facts = get_all_facts(db)  # Fetch all facts from the database
    grouped_facts = []

    # Group facts by num
    for i in range(0, len(all_facts), num):
        group = all_facts[i:i + num]
        grouped_facts.append({
            "group_id": len(grouped_facts) + 1,
            "facts": group
        })

    return grouped_facts
